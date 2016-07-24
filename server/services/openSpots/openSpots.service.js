import db from 'sequelize-connect';
import cache from 'memory-cache';
import moment from 'moment';

import { set, createExtractDataValuesFunction, TIMEZONE } from '../../aux';
import { CalendarService } from '../googleApis';

const extractInfoFromSummary = summary => {
    const appointmentRegex = /(\w.+?)\(.+?\).+/;
    const match = summary.match(appointmentRegex);

    if (!match) {
        return null;
    }

    return {
        // strip trailing whitespace or `#` symbols
        tutor: match[1].replace(/^[\s]+|[#\s]+$/g, ''),
    };
};

const selectRandomTutor = tutors => {
    if (tutors.length === 0) {
        throw new Error('No available tutors');
    }

    const randomIndex = Math.floor(Math.random() * tutors.length);
    return tutors[randomIndex];

};

const collectData = () => new Promise(async (resolve, reject) => {
    const Location = db.models.location;
    const Tutor = db.models.tutor;
    const Schedule = db.models.schedule;
    const Course = db.models.course;

    const extractLocation = createExtractDataValuesFunction(['id', 'name', 'calendarId']);
    const extractCourse = createExtractDataValuesFunction(['id', 'name', 'code', 'color']);
    const extractTutor = createExtractDataValuesFunction(['id', 'name', 'courses']);
    const extractSchedule = createExtractDataValuesFunction(['id', 'weekday', 'time', 'tutors']);

    try {
        const locationsRes = await Location.findAll();
        const locations = locationsRes.map(locationRes => extractLocation(locationRes));

        let data = locations.map(location => new Promise(async (resolve, reject) => {
            const coursesRes = await Course.findAll({
                where: {
                    locationId: location.id,
                },
            });

            const courses = coursesRes
                      .map(courseRes => extractCourse(courseRes));

            const tutorsRes = await Tutor.findAll({
                where: { locationId: location.id },
                include: [{ model: Course, as: 'courses' }],
            });

            const tutors = tutorsRes
                      .map(tutorRes => extractTutor(tutorRes))
                      .map(tutor => set(tutor, 'courses', tutor.courses.map(course => extractCourse(course))));

            const schedulesRes = await Schedule.findAll({
                where: { locationId: location.id },
                include: [{ model: Tutor, as: 'tutors' }],
            });

            const schedules = schedulesRes
                      .map(scheduleRes => extractSchedule(scheduleRes))
                      .map(schedule => set(schedule, 'tutors', schedule.tutors.map(tutor => extractTutor(tutor))));
            resolve({
                location,
                courses,
                tutors,
                schedules,
            });
        }));

        data = await Promise.all(data);
        resolve(data);
    } catch (err) {
        reject(err);
    }
});

const getCachedData = () => new Promise(async (resolve, reject) => {
    const DATA_KEY = 'data';
    let data = cache.get(DATA_KEY);

    if (!data) {
        try {
            data = await collectData();
        } catch (err) {
            reject(err);
        }
        cache.put(DATA_KEY, data, 0.5 * 60000, () => {
            getCachedData(); // refresh cache automatically every two hours
        });
    }

    resolve(data);
});

export const openSpots = async (locationId, courseId, startDate, endDate) => {
    /* locationId: Int,
       courseId: Int,
       startDate: moment Date,
       endDate: moment Date,
     */

    moment.tz.setDefault(TIMEZONE);
    // as of now course and location are passed in as a database ID
    const data = await getCachedData();

    // select the correct data blob
    const locationData = data.find(d => d.location.id === locationId);

    if (!locationData) {
        throw new Error('Selected location does not exist');
    }

    // find tutors that can tutor selected course
    const selectedTutors = locationData.tutors
              .filter(t => !!t.courses.find(c => c.id === courseId));

    // go through schedule and count tutors that are selected and present
    const scheduleCounts = locationData.schedules
              .map(s => ({
                  weekday: s.weekday,
                  time: s.time,
                  count: s.tutors.filter(t => !!selectedTutors.find(ti => t.id === ti.id)).length,
              }));

    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarId = locationData.location.calendarId;
    const calItems = await calendarService.getCalendarEvents(calendarId, startDate.toISOString(), endDate.toISOString());

    // convert weekday and hour from the ISO string to the DB format
    // 1..7 for weekday, num_minutes since midnight for time
    const calendarCounts = calItems.reduce((results, item) => {
        const appointmentInfo = extractInfoFromSummary(item.summary);
        if (!appointmentInfo) {
            // this this will happen if the appointment did not match regex test
            return results;
        }
        const tutorName = appointmentInfo.tutor;
        const time = moment(item.start.dateTime).hours() * 60 + moment(item.start.dateTime).minutes();
        const weekday = parseInt(moment(item.start.dateTime).format('E'), 10);

        let existingResult;
        if (!!selectedTutors.find(t => t.name.toLowerCase() === tutorName.toLowerCase())) {
            existingResult = results.find(r => r.weekday === weekday && r.time === time);
            if (existingResult) {
                existingResult.count += 1;
            } else {
                existingResult = {
                    weekday,
                    time,
                    count: 1,
                };
                return results.concat(existingResult);
            }
        }
        return results;
    }, []);

    const openSpots = scheduleCounts.map(sc => {
        // find an appropriate calendarCount
        const cc = calendarCounts.find(cc => sc.weekday === cc.weekday && sc.time === cc.time);
        return {
            ...sc,
            // if a calendarCount was found we subtract it, otherwise just subtract 0
            count: sc.count - (cc ? cc.count : 0),
        };
    });

    return openSpots;
};

export const findAvailableTutor = async ({ time, course, location }) => {
    moment.tz.setDefault(TIMEZONE);
    const data = await getCachedData();
    const locationData = data.find(d => d.location.id === location.id);

    // Convert time into a format that is stored in the database schedule model
    const timeRaw = moment(time).hours() * 60 + moment(time).minutes();
    // Convert weekday into a format that is stored in the database schedule model
    const weekdayRaw = parseInt(moment(time).format('E'), 10);

    const selectedSchedule = locationData.schedules.find(s => s.weekday === weekdayRaw && s.time === timeRaw);
    if (!selectedSchedule) {
        throw new Error('Schedule not found');
    }
    // `join` scheduled tutors and location tutors, that is find a complete list of scheduled tutors with
    // all the information
    const scheduledTutors = selectedSchedule.tutors.map(
        scheduledTutor => locationData.tutors.find(tutor => scheduledTutor.id === tutor.id)
    );

    // filter out tutors that can't tutor a required course
    const filteredScheduledTutors = scheduledTutors.filter(
        tutor => !!tutor.courses.find(c => c.id === course.id)
    );

    // go to google calendar and get a list of names of tutors that are
    // scheduled at the selected time + find diff b/w filteredScheduledTutors and that list
    // by name lowercased
    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarId = locationData.location.calendarId;
    const calItems = await calendarService.getCalendarEvents(calendarId,
                                                             time.toISOString(),
                                                             moment(time).add(1, 'hours').toISOString());

    const busyTutorsNames = calItems.reduce((results, item) => {
        const appointmentInfo = extractInfoFromSummary(item.summary);
        return appointmentInfo ? results.concat(appointmentInfo.tutor) : results;
    }, []);

    // Keep only tutors whose names are not in the busyTutorsNames array
    const availableTutors = filteredScheduledTutors.filter(
        tutor =>
            !busyTutorsNames.find(name => name.toLowerCase() === tutor.name.toLowerCase())
    );

    return selectRandomTutor(availableTutors);
};
