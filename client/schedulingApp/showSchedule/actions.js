import axios from 'axios';
import moment from 'moment';

export const SA_GET_OPEN_SPOTS = 'SA_GET_OPEN_SPOTS';
export const SA_GET_LOCATIONS = 'SA_GET_LOCATIONS';
export const SA_GET_COURSES = 'SA_GET_COURSES';
export const SA_SET_LOCATION = 'SA_SET_LOCATION';
export const SA_SET_COURSE = 'SA_SET_COURSE';
export const SA_SET_START_DATE = 'SA_SET_START_DATE';

const BASE_URL = '/api/open-spots';
const BASE_URL_LOCATIONS = '/api/locations';
const BASE_URL_COURSES = '/api/courses';

export function getOpenSpots(location, course, startDate) {
    const requestParams = {
        locationId: location.id,
        courseId: course.id,
        startDate: startDate.format('YYYY-MM-DD'),
    };

    const request = axios.get(BASE_URL, {
        params: {
            ...requestParams,
        },
    });

    return {
        type: SA_GET_OPEN_SPOTS,
        payload: request,
    };
}

export function getLocations() {
    const request = axios.get(BASE_URL_LOCATIONS);

    return {
        type: SA_GET_LOCATIONS,
        payload: request,
    };
}

export function getCourses() {
    const request = axios.get(BASE_URL_COURSES);

    return {
        type: SA_GET_COURSES,
        payload: request,
    };
}

export function setLocation(location) {
    // location is an object with value and label from select
    return {
        type: SA_SET_LOCATION,
        payload: location,
    };
}

export function setCourse(course) {
    return {
        type: SA_SET_COURSE,
        payload: course,
    };
}

export function setStartDate(date) {
    return {
        type: SA_SET_START_DATE,
        payload: date,
    };
}
