import axios from 'axios';

export const SA_GET_USER_PROFILE = 'SA_GET_USER_PROFILE';
export const SA_UPDATE_USER_PROFILE = 'SA_UPDATE_USER_PROFILE';

const BASE_URL = '/api/user';

export function getUserProfile() {
    const request = axios.get(`${BASE_URL}/profile`);
    return {
        type: SA_GET_USER_PROFILE,
        payload: request,
    };
}

export function updateUserProfile(values) {
    const {
        locationId,
        courseId,
        nextAppointment,
        firstName,
        lastName,
    } = values;

    const requestBody = {
        location: locationId ? { id: locationId } : null,
        course: courseId ? { id: courseId } : null,
        nextAppointment,
        firstName,
        lastName,
    };

    const request = axios.put(`${BASE_URL}/profile`, requestBody);

    return {
        type: SA_UPDATE_USER_PROFILE,
        payload: request,
    };
}
