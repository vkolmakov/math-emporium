import cache from 'memory-cache';

import { Either } from '../aux';

const MESSAGES = {
    MISS: 'CACHE_MISS',
    INVALIDATE: 'CACHE_INVALIDATE',
};

const keys = {
    calendarEvents: (calendarId) => `CALENDAR_EVENTS-${calendarId}`,
};

const DURATIONS = {
    CALENDAR_EVENTS: 4 * 60 * 1000, // 4 minutes
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
