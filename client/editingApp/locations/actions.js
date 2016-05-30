import axios from 'axios';

export const GET_LOCATIONS = 'GET_LOCATIONS';
export const CREATE_LOCATION = 'CREATE_LOCATION';
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

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

export function createLocation(data) {
    const request = axios.post(`${API_URL}${API_TYPE}${EXTENSION}`, data);

    return {
        type: CREATE_LOCATION,
        payload: request,
    };
}

export function setCurrentLocation(location) {
    console.log(location);

    return {
        type: SET_CURRENT_LOCATION,
        payload: location,
    };
}
