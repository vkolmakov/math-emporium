export const TIMESTAMP_FORMAT = 'YYYY-MM-DD-HH-mm';
export const TIMESTAMP_VISIBLE_FORMAT = 'MM/DD/YYYY h:mm a';
export const TIMEZONE = 'US/Central';

export const AUTH_GROUPS = {
    user: 1,
    employee: 2,
    employer: 3,
    admin: 4,
};

export function isObject(obj) {
    return obj === Object(obj);
}

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
            result[fieldName] = data.get(fieldName);
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

export function pickOneFrom(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

export const extractInfoFromSummary = summary => {
    const appointmentRegex = /(\w.+?)\((.+?)\)(.+)/;
    const match = summary.match(appointmentRegex);

    if (!match) {
        return null;
    }

    return {
        tutor: match[1].replace(/^[\s]+|[#\s]+$/g, ''), // strip trailing whitespace or `#` symbols
        student: match[2],
        course: match[3],
    };
};

export const extractSpecialInstructions = summary => {
    const instructionsRegex = /^_\d+\*\((.+?)\)$/;
    const match = summary.match(instructionsRegex);

    if (!match) {
        return null;
    }

    return {
        overwriteTutors: match[1].split('-').map(tutorName => ({ name: tutorName })),
    };
};

