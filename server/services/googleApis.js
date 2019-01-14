import googleapis from "googleapis";

import cache from "./cache";
import { errorMessage } from "./errorMessages";

import { TIMEZONE, R, Either, dateTime } from "../aux";
import config from "../config";

function decodeServiceKey(base64ServiceKey) {
    return Buffer.from(base64ServiceKey, "base64");
}

function getAuth(resource) {
    const SERVICE_ACCOUNT_EMAIL = config.google.SERVICE_ACCOUNT;
    const SERVICE_KEY_BUFFER = decodeServiceKey(config.google.SERVICE_KEY);
    return new Promise((resolve, reject) => {
        const authClient = new googleapis.auth.JWT(
            SERVICE_ACCOUNT_EMAIL,
            null,
            SERVICE_KEY_BUFFER,
            [`https://www.googleapis.com/auth/${resource}`]
        );

        authClient.authorize((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(authClient);
            }
        });
    });
}

function toCalendarEvent(googleCalendarEvent) {
    const { summary, start, id, htmlLink } = googleCalendarEvent;

    return {
        summary,
        start,
        id,
        directCalendarEventLink: htmlLink,
        startDateTimeObject: dateTime.fromISOString(start.dateTime),
    };
}

class CalendarService {
    constructor() {
        this.isInitialized = false;
    }

    initialize() {
        getAuth("calendar").then((auth) => {
            this.auth = auth;
            this.calendar = googleapis.calendar("v3");
            this.isInitialized = true;
        });
    }

    getCalendarEvents(calendarId, startDate, endDate, options) {
        const { useCache } = options;

        const fetchEvents = () =>
            new Promise((resolve, reject) => {
                this.calendar.events.list(
                    {
                        auth: this.auth,
                        calendarId,
                        maxResults: 1500,
                        singleEvents: true,
                        timeMin: startDate,
                        timeMax: endDate,
                        timeZone: TIMEZONE,
                    },
                    (err, result) => {
                        if (err) {
                            let errorText;

                            if (err.code === 404) {
                                // Treating this error as 500 because from the standpoint of
                                // the application it's not actually a 404 and should not be logged
                                // and exposed as such.
                                errorText = [
                                    `Could not reach Google calendar ${calendarId}.`,
                                    "Make sure that the Google calendar ID is correct and shared with the service account.",
                                    `Full error: ${JSON.stringify(err)}`,
                                ].join(" ");
                            } else {
                                errorText = `Google calendar error for ${calendarId}: ${JSON.stringify(
                                    err
                                )}`;
                            }

                            reject(errorMessage(errorText, 500));
                        } else {
                            resolve(result.items.map(toCalendarEvent));
                        }
                    }
                );
            });

        const cacheAndReturnEvents = (events) => {
            cache.calendarEvents.put(calendarId, startDate, events);
            return Promise.resolve(events);
        };

        if (!useCache) {
            return fetchEvents();
        }

        return Either.either(
            () => fetchEvents().then(cacheAndReturnEvents),
            (events) => Promise.resolve(events),
            cache.calendarEvents.get(calendarId, startDate)
        );
    }

    createCalendarEvent({
        calendarId,
        startTime,
        endTime,
        summary,
        description,
        colorId,
    }) {
        return new Promise((resolve, reject) => {
            this.calendar.events.insert(
                {
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
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    deleteCalendarEvent({ calendarId, eventId }) {
        return new Promise((resolve, reject) => {
            this.calendar.events.delete(
                {
                    auth: this.auth,
                    calendarId,
                    eventId,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }
}

const _calendarService = new CalendarService();
_calendarService.initialize();

export async function calendarService() {
    if (!_calendarService.isInitialized) {
        await _calendarService.initialize();
    }

    return _calendarService;
}

export function calendarServiceFactory() {
    return _calendarService;
}
