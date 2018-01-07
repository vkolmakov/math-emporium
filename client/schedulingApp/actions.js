import axios from 'axios';

import * as spd from '../sharedPublicData/actions';

export const SA_GET_SUBJECTS = 'SA_GET_SUBJECTS';
export const SA_GET_COURSES = 'SA_GET_COURSES';
export const SA_SET_SUBJECT = 'SA_SET_SUBJECT';
export const SA_SET_LOCATION = 'SA_SET_LOCATION';
export const SA_SET_COURSE = 'SA_SET_COURSE';
export const SA_INITIALIZE = 'SA_INITIALIZE';
export const SA_GET_LOCATIONS = spd.SA_GET_LOCATIONS;

const BASE_URL_SUBJECTS = '/api/public/subjects';
const BASE_URL_COURSES = '/api/public/courses';

import { resetOpenSpots } from './showSchedule/actions';

export function markAsInitialized() {
    return { type: SA_INITIALIZE };
}

export const getLocations = spd.getLocations;

export function getSubjects() {
    const request = axios.get(BASE_URL_SUBJECTS);

    return {
        type: SA_GET_SUBJECTS,
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
        // every time we change the location we have to reset the selected course and subject
        dispatch({
            type: SA_SET_COURSE,
            payload: null,
        });
        dispatch({
            type: SA_SET_SUBJECT,
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

export function setSubject(subject) {
    return dispatch => {
        // every time we change the subject we have to reset the selected course
        dispatch({
            type: SA_SET_COURSE,
            payload: null,
        });

        // also we need to nullify the openSpots
        dispatch(resetOpenSpots());

        dispatch({
            type: SA_SET_SUBJECT,
            payload: subject,
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
