import axios from 'axios';

export const GET_EVENTS = 'GET_EVENTS';

const BASE_URL = '/api/events';

export function getEvents() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_EVENTS,
        payload: request,
    };
}
