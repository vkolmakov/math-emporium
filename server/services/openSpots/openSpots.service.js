import db from 'sequelize-connect';
import cache from 'memory-cache';
import moment from 'moment';

import { set, createExtractDataValuesFunction } from '../../aux';
import { CalendarService } from '../googleApis';

const extractInfoFromSummary = summary => ({
    tutor: summary,
});

const collectData = () => new Promise(async (resolve, reject) => {
    const Location = db.models.location;
    const Tutor = db.models.tutor;
    const Schedule = db.models.schedule;
    const Course = db.models.course;

    const extractLocation = createExtractDataValuesFunction(['id', 'name']);
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
                }
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
})

export const openSpots = async (locationId, courseId, startTime, endTime) => {
    /* locationId: Int,
       courseId: Int,
       startTime: moment Date,
       endTime: moment Date,
     */

    // as of now course and location are passed in as a database ID
    const data = await getCachedData()

    // select the correct data blob
    const locationData = data.find(d => d.location.id === locationId);

    if (!locationData) {
        throw new Error('Selected location does not exist');
    }

    // find tutors that can tutor selected course
    const selectedTutors = locationData.tutors
              .filter(t => !!t.courses.find(c => c.id === courseId))

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
    const calItems = await calendarService.getCalendarEvents(calendarId, startTime.toISOString(), endTime.toISOString());

    // convert weekday and hour from the ISO string to the DB format
    // 1..7 for weekday, num_minutes since midnight for time
    const calendarCounts = calItems.reduce((results, item) => {
        const tutorName = extractInfoFromSummary(item.summary).tutor;
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
                }
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
        }
    });

    return openSpots;
}
