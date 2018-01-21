import axios from 'axios';
import { setCourse, setLocation, setSubject } from '../actions';

export const SA_GET_USER_PROFILE = 'SA_GET_USER_PROFILE';
export const SA_UPDATE_USER_PROFILE = 'SA_UPDATE_USER_PROFILE';
export const SA_SET_USER_PROFILE = 'SA_SET_USER_PROFILE';

const BASE_URL = '/api/user';

export function getUserProfile() {
    const request = axios.get(`${BASE_URL}/profile`);

    return {
        type: SA_SET_USER_PROFILE,
        payload: request,
    };
}

export function setOpenSpotDataFromProfile(profile) {
    return (dispatch) => {
        const { location, course, subject } = profile;

        dispatch(setLocation(location));
        dispatch(setSubject(subject));
        dispatch(setCourse(course));
    };
}

export function updateUserProfile(values) {
    return dispatch => {
        const {
            location: locationId,
            course: courseId,
            subject: subjectId,
            firstName,
            lastName,
        } = values;

        const location = locationId ? { id: locationId } : null;
        const course = courseId ? { id: courseId } : null;
        const subject = subjectId ? { id: subjectId } : null;

        const requestBody = {
            location,
            course,
            subject,
            firstName,
            lastName,
        };

        return axios.put(`${BASE_URL}/profile`, requestBody)
            .then(response => {
                dispatch({
                    type: SA_SET_USER_PROFILE,
                    payload: response,
                });
                return response;
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
