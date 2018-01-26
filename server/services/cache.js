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

    keyNames: {
        calendarEvents: (calendarId, startDateIsoString) =>
            `CALENDAR_EVENTS-${calendarId}-${startDateIsoString}`,
        appData: () => 'APP_DATA',
    },

    existingKeys() {
        return memoryCache.keys();
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

const calendarEvents = {
    invalidate(calendarId) {
        const toRemove = _cache.existingKeys().filter((key) => key.includes(calendarId));
        toRemove.forEach(_cache.remove);
        return toRemove;
    },

    put(calendarId, weekStartIsoString, events) {
        return _cache.put(
            _cache.keyNames.calendarEvents(calendarId, weekStartIsoString),
            events,
            _cache.DURATIONS.CALENDAR_EVENTS);
    },
    get(calendarId, weekStartIsoString) {
        return _cache.get(_cache.keyNames.calendarEvents(calendarId, weekStartIsoString));
    },
};

const appData = {
    invalidate() {
        return _cache.existingKeys()
            .filter((key) => key === _cache.keyNames.appData())
            .forEach(_cache.remove);
    },
    put(data) {
        return _cache.put(_cache.keyNames.appData(), data, _cache.DURATIONS.APP_DATA);
    },

    get() {
        return _cache.get(_cache.keyNames.appData());
    },
};

export default {
    calendarEvents,
    appData,
};
