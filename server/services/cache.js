import cache from 'memory-cache';

import { Either } from '../aux';

const MESSAGES = {
    MISS: 'CACHE_MISS',
    INVALIDATE: 'CACHE_INVALIDATE',
};

const keys = {
    calendarEvents: (calendarId) => `CALENDAR_EVENTS-${calendarId}`,
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
    return cache.del(key);
}

function put(key, value, duration) {
    cache.put(key, value, duration);
    return value;
}

export default {
    keys,
    get,
    put,
    remove,
    DURATIONS,
    MESSAGES,
};
