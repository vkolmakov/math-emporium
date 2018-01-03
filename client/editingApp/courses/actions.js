import axios from 'axios';

export const GET_COURSES = 'GET_COURSES';
export const CREATE_COURSE = 'CREATE_COURSE';
export const DELETE_COURSE = 'DELETE_COURSE';
export const UPDATE_COURSE = 'UPDATE_COURSE';

const BASE_URL = '/api/courses';

export function getCourses() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_COURSES,
        payload: request,
    };
}

export function createCourse(data) {
    const locationId = data.location;
    const subjectId = data.subject;

    const requestData = {
        ...data,
        location: {
            id: locationId,
        },
        subject: {
            id: subjectId,
        },
    };
    const request = axios.post(BASE_URL, requestData);

    return {
        type: CREATE_COURSE,
        payload: request,
    };
}

export function deleteCourse(id) {
    const request = axios.delete(`${BASE_URL}/${id}`);

    return {
        type: DELETE_COURSE,
        payload: request,
    };
}

export function updateCourse(id, data) {
    return dispatch => {
        const locationId = data.location;
        const subjectId = data.subject;

        const requestData = {
            ...data,
            location: {
                id: locationId,
            },
            subject: {
                id: subjectId,
            },
        };

        return axios.put(`${BASE_URL}/${id}`, requestData).then(
            res => {
                dispatch({ type: UPDATE_COURSE, payload: res });
                return Promise.resolve();
            },
            err => {
                dispatch({ type: UPDATE_COURSE, payload: err });
                return Promise.reject();
            }
        );
    };
}
