import axios from 'axios';

export const SA_GET_LOCATIONS = 'SA_GET_LOCATIONS';
export const SA_GET_COURSES = 'SA_GET_COURSES';
export const SA_SET_LOCATION = 'SA_SET_LOCATION';
export const SA_SET_COURSE = 'SA_SET_COURSE';

const BASE_URL_LOCATIONS = '/api/locations';
const BASE_URL_COURSES = '/api/courses';

import { resetOpenSpots } from './showSchedule/actions';

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
    return dispatch => {
        // every time we change the location we have to reset the selected course
        dispatch({
            type: SA_SET_COURSE,
            payload: null,
        });

        // also we need to nullify the openSpots
        dispatch(resetOpenSpots());

        dispatch({
            type: SA_SET_LOCATION,
            payload: location,
        });
    };
}

export function setCourse(course) {
    return dispatch => {
        // need to reset open spots every time we change a course
        dispatch(resetOpenSpots());

        dispatch({
            type: SA_SET_COURSE,
            payload: course,
        });
    };
}
