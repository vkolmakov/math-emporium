import axios from "axios";

export const GET_SUBJECTS = "GET_SUBJECTS";
export const CREATE_SUBJECT = "CREATE_SUBJECT";
export const DELETE_SUBJECT = "DELETE_SUBJECT";
export const UPDATE_SUBJECT = "UPDATE_SUBJECT";

const BASE_URL = "/api/subjects";

export function getSubjects() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_SUBJECTS,
        payload: request,
    };
}

export function createSubject(data) {
    const locationId = data.location;

    const requestData = {
        ...data,
        location: {
            id: locationId,
        },
    };
    const request = axios.post(BASE_URL, requestData);

    return {
        type: CREATE_SUBJECT,
        payload: request,
    };
}

export function deleteSubject(id) {
    const request = axios.delete(`${BASE_URL}/${id}`);

    return {
        type: DELETE_SUBJECT,
        payload: request,
    };
}

export function updateSubject(id, data) {
    return (dispatch) => {
        const locationId = data.location;

        const requestData = {
            ...data,
            location: {
                id: locationId,
            },
        };

        return axios.put(`${BASE_URL}/${id}`, requestData).then(
            (res) => {
                dispatch({ type: UPDATE_SUBJECT, payload: res });
                return Promise.resolve();
            },
            (err) => {
                dispatch({ type: UPDATE_SUBJECT, payload: err });
                return Promise.reject();
            },
        );
    };
}
