import axios from 'axios';
import moment from 'moment';

import { TIMESTAMP_FORMAT } from '../../constants';

import { getUserProfile } from '../profile/actions';

export const SA_GET_OPEN_SPOTS = 'SA_GET_OPEN_SPOTS';
export const SA_SET_START_DATE = 'SA_SET_START_DATE';
export const SA_RESET_OPEN_SPOTS = 'SA_RESET_OPEN_SPOTS';
export const SA_SCHEDULE_APPOINTMENT = 'SA_SCHEDULE_APPOINTMENT';

const BASE_URL = '/api/open-spots';
const BASE_URL_APPOINTMENT = '/api/user/appointment';

export function getOpenSpots(location, course, startDate) {
    const requestParams = {
        locationId: location.id,
        courseId: course.id,
        startDate: startDate.format(TIMESTAMP_FORMAT),
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

export function scheduleAppointment({ location, course, time }) {
    return dispatch => {
        const requestData = {
            location,
            course,
            time: time.format(TIMESTAMP_FORMAT),
        };

        axios.post(BASE_URL_APPOINTMENT, requestData)
            .then(response => {
                dispatch(getUserProfile());
            })
            .catch(err => {
                // TODO: Dispatch an error to display
                console.log(err);
            });
        return Promise.resolve();
    };
}
