import axios from 'axios';

export const GET_USERS = 'GET_USERS';

const BASE_URL = '/api/users';

export function getUsers() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_USERS,
        payload: request,
    };
}
