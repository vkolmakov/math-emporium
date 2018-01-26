import memoryCache from 'memory-cache';

import { Either } from '../aux';

const minutes = (n) => n * 60 * 1000;

const _cache = {
    ERROR_MESSAGES: {
        MISS: 'CACHE_MISS',
    },

    DURATIONS: {
        CALENDAR_EVENTS: minutes(1),
        APP_DATA: minutes(1),
    },

    keys: {
        calendarEvents: (calendarId, startDateIsoString) =>
            `CALENDAR_EVENTS-${calendarId}-${startDateIsoString}`,
        appData: () => 'APP_DATA',
    },

    get(key) {
        return Either.toEither(_cache.ERROR_MESSAGES.MISS, memoryCache.get(key));
    },

    remove(key) {
        memoryCache.del(key);
        return key;
    },

    put(key, value, duration) {
        memoryCache.put(key, value, duration);
        return value;
    },
};

function invalidateCalendarEventsCache(calendarId) {
    const toRemove = memoryCache.keys().filter((key) => key.includes(calendarId));
    toRemove.forEach(_cache.remove);
    return toRemove;
}

function putCalendarEvents(calendarId, weekStartIsoString, events) {
    return _cache.put(
        _cache.keys.calendarEvents(calendarId, weekStartIsoString),
        events,
        _cache.DURATIONS.CALENDAR_EVENTS);
}

function getCalendarEvents(calendarId, weekStartIsoString) {
    return _cache.get(_cache.keys.calendarEvents(calendarId, weekStartIsoString));
}

function putAppData(data) {
    return _cache.put(_cache.keys.appData(), data, _cache.DURATIONS.APP_DATA);
}

function getAppData() {
    return _cache.get(_cache.keys.appData());
}

function invalidateAppDataCache() {
    return memoryCache.keys().filter((key) => key === _cache.keys.appData());
}

export default {
    // calendar events
    invalidateCalendarEventsCache,
    putCalendarEvents,
    getCalendarEvents,
    // app data
    invalidateAppDataCache,
    putAppData,
    getAppData,
};
