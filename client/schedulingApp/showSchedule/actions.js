import axios from 'axios';

import { TIMESTAMP_FORMAT, RANDOM_TUTOR } from '../constants';

export const SA_GET_OPEN_SPOTS = 'SA_GET_OPEN_SPOTS';
export const SA_SET_START_DATE = 'SA_SET_START_DATE';
export const SA_RESET_OPEN_SPOTS = 'SA_RESET_OPEN_SPOTS';
export const SA_SCHEDULE_APPOINTMENT = 'SA_SCHEDULE_APPOINTMENT';
export const SA_SCHEDULING_MESSAGE = 'SA_SCHEDULING_MESSAGE';
export const SA_CLEAR_SCHEDULING_MESSAGE = 'SA_CLEAR_SCHEDULING_MESSAGE';
export const SA_SELECT_OPEN_SPOT = 'SA_SELECT_OPEN_SPOT';
export const SA_CLEAR_OPEN_SPOT_SELECTION = 'SA_CLEAR_OPEN_SPOT_SELECTION';
export const SA_DISPLAY_TUTOR_SELECTION_MODAL = 'SA_DISPLAY_TUTOR_SELECTION_MODAL';

const BASE_URL = '/api/open-spots';
const BASE_URL_APPOINTMENT = '/api/user/appointment';
const BASE_URL_TUTORS = '/api/available-tutors';

export function getOpenSpots({ location, course, startDate }) {
    const requestParams = {
        locationId: location.id,
        courseId: course.id,
        startDate: startDate.format(TIMESTAMP_FORMAT),
    };

    const request = axios.get(BASE_URL, {
        params: { ...requestParams },
    });

    return {
        type: SA_GET_OPEN_SPOTS,
        payload: request,
    };
}

export function resetOpenSpots() {
    return {
        type: SA_RESET_OPEN_SPOTS,
    };
}

export function setStartDate(date) {
    return {
        type: SA_SET_START_DATE,
        payload: date,
    };
}

export function schedulingMessage(err) {
    return {
        type: SA_SCHEDULING_MESSAGE,
        payload: err,
    };
}

export function clearSchedulingMessage() {
    return {
        type: SA_CLEAR_SCHEDULING_MESSAGE,
    };
}

export function selectOpenSpot({ time, course, location }) {
    return {
        type: SA_SELECT_OPEN_SPOT,
        payload: { time, course, location },
    };
}

export function clearOpenSpotSelection() {
    return {
        type: SA_CLEAR_OPEN_SPOT_SELECTION,
    };
}

export function displayTutorSelectionModal({ tutors }) {
    return {
        type: SA_DISPLAY_TUTOR_SELECTION_MODAL,
        payload: tutors,
    };
}

export function scheduleAppointment({ location, course, time, requestedTutor, additionalComments }) {
    return dispatch => {
        const isRandomTutor = requestedTutor.id === RANDOM_TUTOR.id;
        const tutor = isRandomTutor ? null : requestedTutor;
        const comments = additionalComments || null;

        const requestData = {
            location,
            course,
            time: time.format(TIMESTAMP_FORMAT),
            tutor,
            comments,
        };

        return axios.post(BASE_URL_APPOINTMENT, requestData)
            .then(response => {
                const startMessages = ['Great']; // no more fun times :(
                const messageStart = startMessages[Math.floor(Math.random() * startMessages.length)];
                const successMessage = `${messageStart}, your appointment has been scheduled!`;
                dispatch(schedulingMessage(successMessage));
            })
            .catch(err => {
                const errorMessage = `Oops, ${err.data.error}`;
                dispatch(schedulingMessage(errorMessage));
            });
    };
}

export function getAvailableTutors({ time, course, location }) {
    return dispatch => {
        const requestParams = {
            time: time.format(TIMESTAMP_FORMAT),
            courseId: course.id,
            locationId: location.id,
        };

        return axios.get(BASE_URL_TUTORS, {
            params: { ...requestParams },
        });
    };
}
