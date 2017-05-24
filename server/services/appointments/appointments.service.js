import moment from 'moment';
import db from 'sequelize-connect';

import { CalendarService } from '../googleApis';
import { TIMEZONE, TIMESTAMP_FORMAT, extractInfoFromSummary, extractSpecialInstructions } from '../../aux';

export function _getAppointments(calendarEvents) {
    const appointments = calendarEvents.reduce((results, item) => {
        const appointmentInfo = extractInfoFromSummary(item.summary);
        if (!appointmentInfo) {
            return results;
        }

        const startDateTime = moment(item.start.dateTime);
        const appointment = {
            ...appointmentInfo,
            startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
            weekday: parseInt(startDateTime.format('E'), 10),
            time: startDateTime.hours() * 60 + startDateTime.minutes(),
        };

        return results.concat(appointment);
    }, []);

    return appointments;
}

export const getAppointments = async ({ locationId, startDate, endDate }) => {
    moment.tz.setDefault(TIMEZONE);
    const Location = db.models.location;
    const location = await Location.findOne({
        where: { id: locationId },
    });

    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarId = location.calendarId;
    const calendarEvents = await calendarService.getCalendarEvents(calendarId, startDate.toISOString(), endDate.toISOString());

    return _getAppointments(calendarEvents);
};

export function _getSpecialInstructions(calendarEvents) {
    const specialInstructions = calendarEvents.reduce((results, item) => {
        const instructionsInfo = extractSpecialInstructions(item.summary);
        if (!instructionsInfo) {
            return results;
        }

        const startDateTime = moment(item.start.dateTime);
        const instructions = {
            ...instructionsInfo,
            startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
            weekday: parseInt(startDateTime.format('E'), 10),
            time: startDateTime.hours() * 60 + startDateTime.minutes(),
        };

        return results.concat(instructions);
    }, []);

    return specialInstructions;
}

export const getSpecialInstructions = async ({ locationId, startDate, endDate }) => {
    moment.tz.setDefault(TIMEZONE);
    const Location = db.models.location;

    const location = await Location.findOne({
        where: { id: locationId },
    });

    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarId = location.calendarId;
    const calendarEvents = await calendarService.getCalendarEvents(calendarId, startDate.toISOString(), endDate.toISOString());

    return _getSpecialInstructions(calendarEvents);
};
