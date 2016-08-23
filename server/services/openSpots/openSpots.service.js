import moment from 'moment';

import { TIMEZONE, pickOneFrom } from '../../aux';
import { getCachedData } from '../appData';
import { getAppointments } from '../appointments/appointments.service';

export const selectRandomTutor = tutors => {
    if (tutors.length === 0) {
        throw new Error('No available tutors');
    }

    return pickOneFrom(tutors);
};

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
    const initialCounts = locationData.schedules
              .map(s => ({
                  weekday: s.weekday,
                  time: s.time,
                  count: s.tutors.filter(t => !!selectedTutors.find(ti => t.id === ti.id)).length,
              }));

    const appointments = await getAppointments({ locationId: locationData.location.id, startDate, endDate });
    const scheduledCounts = appointments.reduce((results, item) => {
        const { tutor: tutorName, time, weekday } = item;

        const isSelectedTutor = !!selectedTutors.find(t => t.name.toLowerCase() === tutorName.toLowerCase());
        const isTutor = !!locationData.tutors.find(t => t.name.toLowerCase() === tutorName.toLowerCase());

        let existingResult;
        if (isSelectedTutor || !isTutor) {
            // play it safe, if something unknown was encountered just assume this spot is taken
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

    const openSpots = initialCounts.map(sc => {
        // find an appropriate calendarCount
        const cc = scheduledCounts.find(cc => sc.weekday === cc.weekday && sc.time === cc.time);
        return {
            ...sc,
            // if a calendarCount was found we subtract it, otherwise just subtract 0
            count: sc.count - (cc ? cc.count : 0),
        };
    });

    return openSpots;
};

export const findAvailableTutors = async ({ time, course, location }) => {
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

    const appointments = await getAppointments({
        locationId: locationData.location.id,
        startDate: time,
        endDate: moment(time).add(1, 'hours'),
    });
    const busyTutorsNames = appointments.map(appointment => appointment.tutor);

    // Keep only tutors whose names are not in the busyTutorsNames array
    const availableTutors = filteredScheduledTutors.filter(
        tutor =>
            !busyTutorsNames.find(name => name.toLowerCase() === tutor.name.toLowerCase())
    );

    return availableTutors;
};
