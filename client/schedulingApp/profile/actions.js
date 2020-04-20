import axios from "axios";
import { setCompleteCourseSelection } from "../actions";

export const SA_GET_USER_PROFILE = "SA_GET_USER_PROFILE";
export const SA_UPDATE_USER_PROFILE = "SA_UPDATE_USER_PROFILE";
export const SA_SET_USER_PROFILE = "SA_SET_USER_PROFILE";
export const SA_SET_ACTIVE_USER_APPOINTMENTS =
    "SA_SET_ACTIVE_USER_APPOINTMENTS";
export const SA_SET_RECENT_USER_APPOINTMENTS =
    "SA_SET_RECENT_USER_APPOINTMENTS";

const BASE_URL = "/api/user";
const BASE_URL_APPOINTMENTS = "/api/scheduled-appointments";

export function getUserProfile() {
    const request = axios.get(`${BASE_URL}/profile`);

    return {
        type: SA_SET_USER_PROFILE,
        payload: request,
    };
}

export function getActiveUserAppointments() {
    return (dispatch) => {
        return axios.get(BASE_URL_APPOINTMENTS).then(({ data }) => {
            dispatch(setActiveUserAppointments(data));
        });
    };
}

export function setActiveUserAppointments(appointments) {
    return {
        type: SA_SET_ACTIVE_USER_APPOINTMENTS,
        payload: appointments,
    };
}

export function setOpenSpotDataFromProfile(profile) {
    return (dispatch) => {
        const { location, course, subject } = profile;

        dispatch(setCompleteCourseSelection({ location, course, subject }));
    };
}

export function getRecentUserAppointments() {
    return (dispatch) => {
        // TODO: get this data from an API
        const recentUserAppointmentsRequest = Promise.resolve([
            { courseId: 1 },
            { courseId: 25 },
            { courseId: 30 },
        ]);

        return recentUserAppointmentsRequest.then((recentUserAppointments) => {
            dispatch({
                type: SA_SET_RECENT_USER_APPOINTMENTS,
                payload: recentUserAppointments,
            });
        });
    };
}

export function deleteAppointment(appointment) {
    const { id } = appointment;
    return (dispatch) => {
        return axios.delete(`${BASE_URL_APPOINTMENTS}/${id}`).then(() => {
            return dispatch(getActiveUserAppointments());
        });
    };
}

export function updateUserProfile(values) {
    return (dispatch) => {
        const {
            location: locationId,
            course: courseId,
            subject: subjectId,
            firstName,
            lastName,
            phoneNumber,
        } = values;

        let defaultOptions;
        if ([locationId, courseId, subjectId].every((x) => x === void 0)) {
            defaultOptions = {};
        } else {
            defaultOptions = {
                location: locationId ? { id: locationId } : null,
                course: courseId ? { id: courseId } : null,
                subject: subjectId ? { id: subjectId } : null,
            };
        }

        const requestBody = {
            firstName,
            lastName,
            phoneNumber,
            ...defaultOptions,
        };

        return axios
            .put(`${BASE_URL}/profile`, requestBody)
            .then((response) => {
                dispatch({
                    type: SA_SET_USER_PROFILE,
                    payload: response,
                });
                return response;
            });
    };
}
