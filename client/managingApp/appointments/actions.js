import axios from "axios";
import moment from "moment";

import { TIMESTAMP_DISPLAY_FORMAT } from "../constants";

export const GET_APPOINTMENTS = "GET_APPOINTMENTS";
export const SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA =
    "GET_APPOINTMENT_DIAGNOSTIC_DATA";
export const CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA =
    "CLEAR_APPOINTMENT_DIAGNOSTIC_DATA";

const BASE_URL = "/api/admin/scheduled-appointments";

function processAppointment(appointment) {
    return {
        ...appointment,
        time: moment(appointment.time).format(TIMESTAMP_DISPLAY_FORMAT),
    };
}

export function getActiveAppointments() {
    return (dispatch) => {
        return axios.get(BASE_URL).then((res) => {
            dispatch({
                type: GET_APPOINTMENTS,
                payload: res.data.map(processAppointment),
            });
        });
    };
}

export function getAppointmentDiagnosticData(appointmentId) {
    return function getAppointmentDiagnosicDataThunk(dispatch) {
        return axios.get(`${BASE_URL}/diagnostics/${appointmentId}`).then(
            (response) => {
                dispatch({
                    type: SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
                    payload: response.data,
                });
            },
            (error) => {
                if (error.data && error.data.status === 404) {
                    dispatch({
                        type: SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
                        payload: null,
                    });
                }
            }
        );
    };
}

export function clearAppointmentDiagnosticData() {
    return {
        type: CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
    };
}
