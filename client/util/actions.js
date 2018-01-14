import axios from 'axios';

const BASE_URL_SETTINGS = '/api/public/settings';

export const ROUTE_CHANGE = 'ROUTE_CHANGE';
export const GET_PUBLIC_SETTINGS = 'GET_PUBLIC_SETTINGS';

export function routeChange(routeData) {
    return {
        type: ROUTE_CHANGE,
        payload: routeData,
    };
}

export function getPublicApplicationSettings() {
    return (dispatch) => {
        return axios.get(BASE_URL_SETTINGS)
            .then((response) => dispatch({
                type: GET_PUBLIC_SETTINGS,
                payload: response.data,
            }));
    };
}
