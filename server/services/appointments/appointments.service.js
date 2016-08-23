import moment from 'moment';
import db from 'sequelize-connect';

import { CalendarService } from '../googleApis';
import { TIMEZONE, TIMESTAMP_FORMAT, extractInfoFromSummary } from '../../aux';

export const getAppointments = async ({ locationId, startDate, endDate }) => {
    moment.tz.setDefault(TIMEZONE);
    const Location = db.models.location;

    const location = await Location.findOne({
        where: { id: locationId },
    });

    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarId = location.calendarId;
    const calItems = await calendarService.getCalendarEvents(calendarId, startDate.toISOString(), endDate.toISOString());

    const appointments = calItems.map(calItem => {
        const startDateTime = moment(calItem.start.dateTime);

        return {
            ...extractInfoFromSummary(calItem.summary),
            startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
            weekday: parseInt(startDateTime.format('E'), 10),
            time: startDateTime.hours() * 60 + startDateTime.minutes(),
        };
    });

    return appointments;
};
