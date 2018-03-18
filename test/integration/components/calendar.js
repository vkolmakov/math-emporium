import moment from 'moment';

import { calendarService } from '../../../server/services/googleApis';

const APPOINTMENT_LENGTH = 60;

const calendar = {
    _calendarService: null,
    testCalendarId: null,

    TEST_CALENDAR_NAME: '__TEST_CALENDAR__',

    setup() {
        return calendarService()
            .then((service) => { calendar._calendarService = service; })
            .then(() => calendar._createTestCalendar())
            .then((result) => { calendar.testCalendarId = result.id });
    },

    teardown() {
        return calendar._deleteTestCalendar();
    },

    insertSchedules(schedules) {
        const getEndTimeString = (time) => moment(time).add(APPOINTMENT_LENGTH, 'minutes').toISOString();
        const getStartTimeString = (time) => moment(time).toISOString();
        const createSummary = (schedule) => `_2(${schedule.tutors.map((t) => t.name).join('_')})`;

        const createEvent = (schedule) => calendar._calendarService.createCalendarEvent({
            calendarId: calendar.testCalendarId,
            startTime: getStartTimeString(schedule.time),
            endTime: getEndTimeString(schedule.time),
            summary: createSummary(schedule),
        });

        return Promise.all(schedules.map(createEvent));
    },

    _deleteTestCalendar() {
        return new Promise((resolve, reject) => {
            calendar._calendarService.calendar.calendars.delete({
                auth: calendar._calendarService.auth,
                calendarId: calendar.testCalendarId,
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    _createTestCalendar() {
        return new Promise((resolve, reject) => {
            calendar._calendarService.calendar.calendars.insert({
                auth: calendar._calendarService.auth,
                resource: {
                    summary: calendar.TEST_CALENDAR_NAME,
                },
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: result.id });
                }
            });
        });
    },
};

export default calendar;
