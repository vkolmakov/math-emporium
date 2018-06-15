import axios from "axios";

export const GET_SETTINGS = "GET_SETTINGS";
export const UPDATE_SETTINGS = "UPDATE_SETTINGS";

const BASE_URL = "/api/settings";

export function getSettings() {
    return (dispatch) =>
        axios.get(BASE_URL).then((response) => {
            dispatch({
                type: GET_SETTINGS,
                payload: response.data,
            });
        });
}

export function updateSettings(settings) {
    return (dispatch) =>
        axios.put(BASE_URL, settings).then((response) => {
            dispatch({
                type: UPDATE_SETTINGS,
            });
        });
}
