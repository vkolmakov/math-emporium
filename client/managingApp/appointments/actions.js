import axios from "axios";
import moment from "moment";

import { TIMESTAMP_DISPLAY_FORMAT } from "../constants";

export const GET_APPOINTMENTS = "GET_APPOINTMENTS";

const BASE_URL = "/api/admin/scheduled-appointments";

export function getActiveAppointments() {
    return (dispatch) => {
        return axios.get(BASE_URL).then((res) => {
            dispatch({
                type: GET_APPOINTMENTS,
                payload: [],
            });
        });
    };
}
