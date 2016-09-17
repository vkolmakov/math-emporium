import googleapis from 'googleapis';
import { TIMEZONE } from '../aux';

function getServiceKeyBuffer(serviceKey) {
    return Buffer.from(serviceKey);
}

function getAuth(resource) {
    const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT;
    const SERVICE_KEY_BUFFER = getServiceKeyBuffer(process.env.GOOGLE_SERVICE_KEY);
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

export class CalendarService {
    async create() {
        this.auth = await getAuth('calendar');
        this.calendar = googleapis.calendar('v3');
    }

    getCalendarEvents(calendarId, startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.calendar.events.list({
                auth: this.auth,
                calendarId,
                maxResults: 1500,
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
