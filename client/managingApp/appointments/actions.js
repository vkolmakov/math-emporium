import axios from "axios";
import moment from "moment";

import { TIMESTAMP_DISPLAY_FORMAT } from "../constants";

export const GET_APPOINTMENTS = "GET_APPOINTMENTS";

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
