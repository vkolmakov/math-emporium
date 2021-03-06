import axios from "axios";

export const GET_TUTORS = "GET_TUTORS";
export const CREATE_TUTOR = "CREATE_TUTOR";
export const DELETE_TUTOR = "DELETE_TUTOR";
export const UPDATE_TUTOR = "UPDATE_TUTOR";

const BASE_URL = "/api/tutors";

export function getTutors() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_TUTORS,
        payload: request,
    };
}

export function createTutor(data) {
    const requestData = {
        name: data.name,
        location: { id: data.location },
        courses: data.courses.map((course) => ({ id: course.value })),
    };

    const request = axios.post(BASE_URL, requestData);

    return {
        type: CREATE_TUTOR,
        payload: request,
    };
}

export function deleteTutor(id) {
    const request = axios.delete(`${BASE_URL}/${id}`);

    return {
        type: DELETE_TUTOR,
        payload: request,
    };
}

export function updateTutor(id, data) {
    return (dispatch) => {
        const requestData = {
            name: data.name,
            location: { id: data.location },
            courses: data.courses.map((course) => ({ id: course.value })),
        };

        return axios.put(`${BASE_URL}/${id}`, requestData).then(
            (res) => {
                dispatch({ type: UPDATE_TUTOR, payload: res });
                return Promise.resolve();
            },
            (err) => {
                dispatch({ type: UPDATE_TUTOR, payload: err });
                return Promise.reject();
            }
        );
    };
}
