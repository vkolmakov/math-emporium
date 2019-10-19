import axios from "axios";

export const SPD_GET_LOCATIONS = "SPD_GET_LOCATIONS";
export const SA_GET_LOCATIONS = "SA_GET_LOCATIONS";
export const SPD_GET_SUBJECTS = "SPD_GET_SUBJECTS";
export const SA_GET_SUBJECTS = "SA_GET_SUBJECTS";
export const SPD_GET_COURSES = "SPD_GET_COURSES";
export const SA_GET_COURSES = "SA_GET_COURSES";

const BASE_URL_LOCATIONS = "/api/public/locations";
const BASE_URL_SUBJECTS = "/api/public/subjects";
const BASE_URL_COURSES = "/api/public/courses";

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

export function getSubjects() {
    return (dispatch) => {
        const request = axios.get(BASE_URL_SUBJECTS);
        dispatch({
            type: SA_GET_SUBJECTS,
            payload: request,
        });
        dispatch({
            type: SPD_GET_SUBJECTS,
            payload: request,
        });
    };
}

export function getCourses() {
    return (dispatch) => {
        const request = axios.get(BASE_URL_COURSES);
        dispatch({
            type: SA_GET_COURSES,
            payload: request,
        });
        dispatch({
            type: SPD_GET_COURSES,
            payload: request,
        });
    };
}
