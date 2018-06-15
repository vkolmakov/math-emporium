import memoryCache from "memory-cache";

import { Either, R, timeUnits } from "../aux";

const ITEM_TYPE = {
    APP_DATA: 1,
    CALENDAR_EVENTS: 2,
};

let caches = [];

const _cache = {
    ERROR_MESSAGES: {
        MISS: "CACHE_MISS",
    },

    DURATIONS: {
        [ITEM_TYPE.APP_DATA]: timeUnits.minutes(1),
        [ITEM_TYPE.CALENDAR_EVENTS]: timeUnits.minutes(1),
    },

    MAX_SIZE: {
        [ITEM_TYPE.APP_DATA]: 1,
        [ITEM_TYPE.CALENDAR_EVENTS]: 15,
    },

    keyNames: {
        [ITEM_TYPE.APP_DATA]: () => "APP_DATA",
        [ITEM_TYPE.CALENDAR_EVENTS]: (calendarId, startDateIsoString) =>
            `CALENDAR_EVENTS-${calendarId}-${startDateIsoString}`,
    },

    existingKeys(itemType) {
        return memoryCache.keys().reduce((acc, key) => {
            const { type } = memoryCache.get(key);
            return type === itemType ? acc.concat([key]) : acc;
        }, []);
    },

    get(key) {
        return R.map(
            R.prop("value"),
            Either.toEither(_cache.ERROR_MESSAGES.MISS, memoryCache.get(key)),
        );
    },

    remove(key) {
        memoryCache.del(key);
        return key;
    },

    put(itemType, key, value, duration) {
        if (_cache.existingKeys(itemType).length >= _cache.MAX_SIZE[itemType]) {
            caches.find((cache) => cache.type === itemType).invalidate();
        }

        memoryCache.put(key, { value, type: itemType }, duration);

        return value;
    },
};

const calendarEvents = {
    type: ITEM_TYPE.CALENDAR_EVENTS,

    invalidate(calendarId) {
        return _cache
            .existingKeys(calendarEvents.type)
            .filter((key) => (!!calendarId ? key.includes(calendarId) : true))
            .forEach(_cache.remove);
    },

    put(calendarId, weekStartIsoString, events) {
        const type = calendarEvents.type;

        return _cache.put(
            type,
            _cache.keyNames[type](calendarId, weekStartIsoString),
            events,
            _cache.DURATIONS[type],
        );
    },
    get(calendarId, weekStartIsoString) {
        return _cache.get(
            _cache.keyNames[calendarEvents.type](
                calendarId,
                weekStartIsoString,
            ),
        );
    },
};

const appData = {
    type: ITEM_TYPE.APP_DATA,

    invalidate() {
        return _cache
            .existingKeys(appData.type)
            .filter((key) => key === _cache.keyNames[appData.type]())
            .forEach(_cache.remove);
    },
    put(data) {
        const type = appData.type;
        return _cache.put(
            type,
            _cache.keyNames[type](),
            data,
            _cache.DURATIONS[type],
        );
    },

    get() {
        return _cache.get(_cache.keyNames[appData.type]());
    },
};

caches = [appData, calendarEvents];

export default {
    calendarEvents,
    appData,
};
