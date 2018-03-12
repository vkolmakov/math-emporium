import { calendarService } from '../../../server/services/googleApis';

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
