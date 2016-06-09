import axios from 'axios';

export const GET_COURSES = 'GET_COURSES';
export const CREATE_COURSE = 'CREATE_COURSE';

const API_URL = '/api';
const API_TYPE = '/private';
const EXTENSION = '/courses';

export function getCourses() {
    const request = axios.get(`${API_URL}${API_TYPE}${EXTENSION}`);

    return {
        type: GET_COURSES,
        payload: request,
    };
}

export function createCourse(data) {
    const locationId = data.location;

    const requestData = {
        ...data,
        location: {
            id: locationId,
        },
    };
    const request = axios.post(`${API_URL}${API_TYPE}${EXTENSION}`, requestData);

    return {
        type: CREATE_COURSE,
        payload: request,
    };
}
