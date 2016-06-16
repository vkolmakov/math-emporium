import axios from 'axios';

export const GET_LOCATIONS = 'GET_LOCATIONS';
export const CREATE_LOCATION = 'CREATE_LOCATION';
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';
export const DELETE_LOCATION = 'DELETE_LOCATION';
export const UPDATE_LOCATION = 'UPDATE_LOCATION';

const BASE_URL = '/api/private/locations';

export function getLocations() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_LOCATIONS,
        payload: request,
    };
}

export function createLocation(data) {
    const request = axios.post(BASE_URL, data);

    return {
        type: CREATE_LOCATION,
        payload: request,
    };
}

export function setCurrentLocation(location) {
    return {
        type: SET_CURRENT_LOCATION,
        payload: location,
    };
}

export function deleteLocation(id) {
    const request = axios.delete(`${BASE_URL}/${id}`);

    return {
        type: DELETE_LOCATION,
        payload: request,
    };
}

export function updateLocation(id, data) {
    const request = axios.put(`${BASE_URL}/${id}`, data);

    return {
        type: UPDATE_LOCATION,
        payload: request,
    };
}
