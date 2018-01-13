import axios from 'axios';

export const GET_SETTINGS = 'GET_SETTINGS';

const BASE_URL = '/api/settings';

export function getSettings() {
    return (dispatch) => axios.get(BASE_URL).then((response) => {
        dispatch({
            type: GET_SETTINGS,
            payload: response.data,
        });
    });
}
