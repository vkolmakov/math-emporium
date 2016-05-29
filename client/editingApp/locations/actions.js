import axios from 'axios';

export const GET_LOCATIONS = 'GET_LOCATIONS';

const API_URL = '/api';
const API_TYPE = '/private';
const EXTENSION = '/locations';

export function getLocations() {
    const request = axios.get(`${API_URL}${API_TYPE}${EXTENSION}`);

    return {
        type: GET_LOCATIONS,
        payload: request,
    };
}
