import {
    CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
    GET_APPOINTMENTS,
    SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
} from "./actions";

const INITIAL_STATE = {
    all: [],
    currentlyDisplayedDiagnosticDataEntry: null,
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case GET_APPOINTMENTS: {
            return {
                ...state,
                all: payload,
            };
        }
        case SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA: {
            return {
                ...state,
                currentlyDisplayedDiagnosticDataEntry: payload,
            };
        }

        case CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA: {
            return {
                ...state,
                currentlyDisplayedDiagnosticDataEntry: null,
            };
        }
    }

    return state;
};
