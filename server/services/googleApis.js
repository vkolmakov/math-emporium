import googleapis from 'googleapis';
import { TIMEZONE } from '../aux';
import config from '../config';

function getServiceKeyBuffer(serviceKey) {
    return Buffer.from(serviceKey);
}

function getAuth(resource) {
    const SERVICE_ACCOUNT_EMAIL = config.google.SERVICE_ACCOUNT;
    const SERVICE_KEY_BUFFER = getServiceKeyBuffer(config.google.SERVICE_KEY);
    return new Promise((resolve, reject) => {
        const authClient = new googleapis.auth.JWT(
            SERVICE_ACCOUNT_EMAIL,
            null,
            SERVICE_KEY_BUFFER,
            [`https://www.googleapis.com/auth/${resource}`]
        );

        authClient.authorize((err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(authClient);
            }
        });
    });
}

class CalendarService {
    async create() {
        this.auth = await getAuth('calendar');
        this.calendar = googleapis.calendar('v3');
        this.isCreated = true;
    }

    getCalendarEvents(calendarId, startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.calendar.events.list({
                auth: this.auth,
                calendarId,
                maxResults: 1500,
                singleEvents: true,
                timeMin: startDate,
                timeMax: endDate,
                timeZone: TIMEZONE,
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.items);
                }
            });
        });
    }

    createCalendarEvent({ calendarId, startTime, endTime, summary, description, colorId }) {
        return new Promise((resolve, reject) => {
            this.calendar.events.insert({
                auth: this.auth,
                calendarId,
                resource: {
                    colorId,
                    description,
                    summary,
                    start: {
                        dateTime: startTime,
                        timeZone: TIMEZONE,
                    },
                    end: {
                        dateTime: endTime,
                        timeZone: TIMEZONE,
                    },
                },
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    deleteCalendarEvent({ calendarId, eventId }) {
        return new Promise((resolve, reject) => {
            this.calendar.events.delete({
                auth: this.auth,
                calendarId,
                eventId,
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

const _calendarService = new CalendarService;

export async function calendarService() {
    if (!_calendarService.isCreated) {
        await _calendarService.create();
    }

    return _calendarService;
}
