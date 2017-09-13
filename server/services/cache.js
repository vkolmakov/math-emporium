import cache from 'memory-cache';

import { Either } from '../aux';

const MESSAGES = {
    MISS: 'CACHE_MISS',
    INVALIDATE: 'CACHE_INVALIDATE',
};

const keys = {
    calendarEvents: (calendarId, startDateIsoString) =>
        `CALENDAR_EVENTS-${calendarId}-${startDateIsoString}`,
    appData: () => 'APP_DATA',
};

const minutes = (n) => n * 60 * 1000;

const DURATIONS = {
    CALENDAR_EVENTS: minutes(4),
    APP_DATA: minutes(30),
};

function get(key) {
    return Either.toEither(MESSAGES.MISS, cache.get(key));
}

function remove(key) {
    cache.del(key);
    return key;
}

function put(key, value, duration) {
    cache.put(key, value, duration);
    return value;
}

function invalidateCalendarEventsCache(calendarId) {
    const toRemove = cache.keys().filter((key) => key.includes(calendarId));
    toRemove.forEach(remove);
    return toRemove;
}

function putCalendarEvents(calendarId, weekStartIsoString, events) {
    return put(
        keys.calendarEvents(calendarId, weekStartIsoString),
        events,
        DURATIONS.CALENDAR_EVENTS);
}

function getCalendarEvents(calendarId, weekStartIsoString) {
    return get(keys.calendarEvents(calendarId, weekStartIsoString));
}

export default {
    keys,
    get,
    put,
    remove,
    DURATIONS,
    MESSAGES,
    // calendar events
    invalidateCalendarEventsCache,
    putCalendarEvents,
    getCalendarEvents,
};
