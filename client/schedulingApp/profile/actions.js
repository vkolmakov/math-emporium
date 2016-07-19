import axios from 'axios';
import { setCourse, setLocation } from '../actions';


export const SA_GET_USER_PROFILE = 'SA_GET_USER_PROFILE';
export const SA_UPDATE_USER_PROFILE = 'SA_UPDATE_USER_PROFILE';
export const SA_SET_USER_PROFILE = 'SA_SET_USER_PROFILE';

const BASE_URL = '/api/user';

export function getUserProfile() {
    return dispatch => {
        axios.get(`${BASE_URL}/profile`)
            .then(response => {
                const { locationId, courseId } = response.data;

                const location = locationId ? { id: locationId } : null;
                const course = courseId ? { id: courseId } : null;

                dispatch(setLocation(location));
                dispatch(setCourse(course));

                dispatch({
                    type: SA_SET_USER_PROFILE,
                    payload: response,
                });
            });
    };
}

export function updateUserProfile(values) {
    return dispatch => {
        const {
            location: locationId,
            course: courseId,
            firstName,
            lastName,
        } = values;

        const location = locationId ? { id: locationId } : null;
        const course = courseId ? { id: courseId } : null;

        const requestBody = {
            location,
            course,
            firstName,
            lastName,
        };

        dispatch(setLocation(location));
        dispatch(setCourse(course));

        axios.put(`${BASE_URL}/profile`, requestBody)
            .then(response => {
                dispatch({
                    type: SA_SET_USER_PROFILE,
                    payload: response,
                });
            });
    };
}

export function deleteAppointment() {
    return dispatch => {
        axios.delete(`${BASE_URL}/appointment`)
            .then(response => {
                dispatch(getUserProfile());
            });
        return Promise.resolve();
    };
}
