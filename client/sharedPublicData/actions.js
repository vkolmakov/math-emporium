import axios from 'axios';

export const SPD_GET_LOCATIONS = 'SPD_GET_LOCATIONS';
export const SA_GET_LOCATIONS = 'SA_GET_LOCATIONS';

const BASE_URL_LOCATIONS = '/api/public/locations';

export function getLocations() {
    return (dispatch) => {
        const request = axios.get(BASE_URL_LOCATIONS);
        dispatch({
            type: SA_GET_LOCATIONS,
            payload: request,
        });
        dispatch({
            type: SPD_GET_LOCATIONS,
            payload: request,
        });
    };
}
