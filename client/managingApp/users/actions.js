import axios from 'axios';

export const GET_USERS = 'GET_USERS';
export const UPDATE_USER = 'UPDATE_USER';

const BASE_URL = '/api/users';

export function getUsers() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_USERS,
        payload: request,
    };
}

export function updateUser(id, data) {
    const requestData = {
        active: data.active.value,
        email: data.email,
        group: data.group.value,
    };

    const request = axios.put(`${BASE_URL}/${id}`, requestData);

    return {
        type: UPDATE_USER,
        payload: request,
    };
}
