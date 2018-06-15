import moment from "moment";

import { calendarService } from "../../../server/services/googleApis";

const APPOINTMENT_LENGTH = 60;

const getScheduleEndTimeString = (schedule) =>
    moment(schedule.time)
        .add(APPOINTMENT_LENGTH, "minutes")
        .toISOString();
const getScheduleStartTimeString = (schedule) =>
    moment(schedule.time).toISOString();
const createScheduleSummary = (schedule) =>
    `_2(${schedule.tutors.map((t) => t.name).join("_")})`;
const isSchedulePlaceholderSummary = (summary) => summary.startsWith("_");

const calendar = {
    _calendarService: null,
    testCalendarId: null,

    TEST_CALENDAR_NAME: "__TEST_CALENDAR__",

    setup() {
        return calendarService()
            .then((service) => {
                calendar._calendarService = service;
            })
            .then(() => calendar._createTestCalendar())
            .then((result) => {
                calendar.testCalendarId = result.id;
            });
    },

    teardown() {
        return calendar._deleteTestCalendar();
    },

    insertSchedules(schedules) {
        const createEvent = (schedule) =>
            calendar._calendarService.createCalendarEvent({
                calendarId: calendar.testCalendarId,
                startTime: getScheduleStartTimeString(schedule),
                endTime: getScheduleEndTimeString(schedule),
                summary: createScheduleSummary(schedule),
            });

        return Promise.all(schedules.map(createEvent));
    },

    removeAppointments(appointments) {
        const removeAppointment = (appointment) =>
            calendar._calendarService.deleteCalendarEvent({
                calendarId: appointment.calendarId,
                eventId: appointment.eventId,
            });

        return Promise.all(appointments.map(removeAppointment));
    },

    getAppointments(schedules) {
        const getAppointments = (schedule) => {
            return calendar._calendarService
                .getCalendarEvents(
                    calendar.testCalendarId,
                    getScheduleStartTimeString(schedule),
                    getScheduleEndTimeString(schedule),
                    { useCache: false },
                )
                .then((result) =>
                    result.map((event) => ({
                        id: event.id,
                        summary: event.summary,
                    })),
                );
        };

        const transformCalendarEvents = (acc, calendarEvents) => {
            const transformSingleCalendarEvent = (calendarEvent) => {
                const isSchedulePlaceholder = isSchedulePlaceholderSummary(
                    calendarEvent.summary,
                );

                return isSchedulePlaceholder
                    ? null
                    : {
                          summary: calendarEvent.summary,
                          eventId: calendarEvent.id,
                          calendarId: calendar.testCalendarId,
                      };
            };

            return [
                ...acc,
                ...calendarEvents
                    .map(transformSingleCalendarEvent)
                    .filter((appointment) => appointment !== null),
            ];
        };

        return Promise.all(schedules.map(getAppointments)).then(
            (appointments) => appointments.reduce(transformCalendarEvents, []),
        );
    },

    _deleteTestCalendar() {
        return new Promise((resolve, reject) => {
            calendar._calendarService.calendar.calendars.delete(
                {
                    auth: calendar._calendarService.auth,
                    calendarId: calendar.testCalendarId,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                },
            );
        });
    },

    _createTestCalendar() {
        return new Promise((resolve, reject) => {
            calendar._calendarService.calendar.calendars.insert(
                {
                    auth: calendar._calendarService.auth,
                    resource: {
                        summary: calendar.TEST_CALENDAR_NAME,
                    },
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: result.id });
                    }
                },
            );
        });
    },
};

export default calendar;
