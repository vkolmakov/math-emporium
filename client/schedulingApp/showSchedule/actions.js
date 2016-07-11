import axios from 'axios';

export const SA_GET_OPEN_SPOTS = 'SA_GET_OPEN_SPOTS';
export const SA_GET_LOCATIONS = 'SA_GET_LOCATIONS';
export const SA_GET_COURSES = 'SA_GET_COURSES';
export const SA_SET_LOCATION = 'SA_SET_LOCATION';
export const SA_SET_COURSE = 'SA_SET_COURSE';
export const SA_SET_START_DATE = 'SA_SET_START_DATE';

const BASE_URL = '/api/public/open-spots'
const BASE_URL_LOCATIONS = '/api/private/locations';
const BASE_URL_COURSES = '/api/private/courses';

export function getOpenSpots(location, course, startTime) {
    const requestBody = {
        location,
        course,
        startTime,
    };

    const request = axios.get(BASE_URL, requestBody);

    return {
        type: SA_GET_OPEN_SPOTS,
        payload: request,
    }
}

export function getLocations() {
    const request = axios.get(BASE_URL_LOCATIONS);

    return {
        type: SA_GET_LOCATIONS,
        payload: request,
    }
}

export function getCourses() {
    const request = axios.get(BASE_URL_COURSES);

    return {
        type: SA_GET_COURSES,
        payload: request,
    }
}

export function setLocation(location) {
    // location is an object with value and label from select
    return {
        type: SA_SET_LOCATION,
        payload: location,
    }
}

export function setCourse(course) {
    return {
        type: SA_SET_COURSE,
        payload: course,
    }
}

export function setStartDate(date) {
    console.log(date);
    return {
        type: SA_SET_START_DATE,
        payload: date,
    }
}
