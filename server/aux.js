import * as _R from 'ramda';
import * as _dateFns from 'date-fns';
import { create, env } from 'sanctuary';

const _S = create({ checkTypes: false, env });

export const TIMESTAMP_FORMAT = 'YYYY-MM-DD-HH-mm';
export const TIMESTAMP_VISIBLE_FORMAT = 'MM/DD/YYYY [at] h:mma';
export const TIMEZONE = 'US/Central';
export const APPOINTMENT_LENGTH = 60; // in minutes

export const authGroups = {
    USER: 1,
    EMPLOYEE: 2,
    EMPLOYER: 3,
    ADMIN: 4,
};

export const events = {
    USER_CREATED_APPOINTMENT: 1,
    USER_REMOVED_APPOINTMENT: 2,
    USER_SIGNED_IN: 3,
};

export const isObject = (obj) => obj === Object(obj);

export function hasOneOf(obj, ...keys) {
    return !!obj ? [...keys].some((key) => Object.keys(obj).indexOf(key) > -1) : false;
}

export function createExtractDataValuesFunction(allowedFields) {
    // returns a function that takes in a result from sequelize query
    // and filters them using predefined array of allowedFields
    return (sequelizeRes) => {
        let data = sequelizeRes;
        // Grab only the allowed fields
        return allowedFields.reduce((result, fieldName) => {
            if (data.get) {
                result[fieldName] = data.get(fieldName);
            }
            return result;
        }, {});
    };
}

export function transformRequestToQuery(data) {
    // takes in a request and returns an appropriate query object
    // after modifying tartet keys that may specify one-to-one or many-to-many relations
    // for Location, Course, and Tutor models.
    let queryParams = { ...data };

    // case when request contains location
    if (isObject(data.location) && hasOneOf(data.location, 'id')) {
        // removing original location key from request
        delete queryParams.location;
        // adding indendifier for the database query
        queryParams = { ...queryParams, locationId: data.location.id };
    }
    return queryParams;
}

export function set(obj, key, val) {
    return {
        ...obj,
        [key]: val,
    };
}

export function sanitizeCalendarInput(text) {
    return text.replace(/[^a-zA-Z0-9\s]/gi, '').trim();
}

export function pickOneFrom(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

export const timeUnits = {
    minutes: (n) => n * 60 * 1000,
    hours: (n) => timeUnits.minutes(60 * n),
    days: (n) => timeUnits.hours(24 * n),
};

export const Either = {
    Right: _S.Right,
    Left: _S.Left,
    either: _S.either,
    toEither: _S.toEither,
    isLeft: _S.isLeft,
    isRight: _S.isRight,
    rights: _S.rights,
};

export const R = {
    map: _S.map,
    prop: _R.prop,
    propEq: _R.propEq,
    pipe: _R.pipe,
    compose: _R.compose,
    head: _R.head,
    range: _R.range,
    contains: _R.contains,
    pick: _R.pick,
    curry: _R.curry,
    differenceWith: _R.differenceWith,
    eqProps: _R.eqProps,
    reduce: _R.reduce,
    filter: _R.filter,
    length: _R.length,
    append: _R.append,
    flatten: _R.flatten,
    find: _R.find,
    flip: _R.flip,
    last: _R.last,
    toLower: _R.toLower,
    slice: _R.slice,
    equals: _R.equals,
    identity: _R.identity,
    innerJoin: _R.innerJoin,
};

export const trace = msg => x => { console.log(msg, x); return x; };

export const dateTime = {
    now(timezone = TIMEZONE) {
        const now = new Date();
        now.setTimezone(timezone);
        return now;
    },

    formatVisible(dt) {
        return _dateFns.format(dt, TIMESTAMP_VISIBLE_FORMAT);
    },

    parse(other, timezone = TIMEZONE) {
        const result = _dateFns.parse(other);
        result.setTimezone(timezone);
        return result;
    },

    addMinutes(dt, minutes) {
        return _dateFns.addMinutes(dt, minutes);
    },
};
