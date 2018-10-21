import {
    CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
    GET_APPOINTMENTS,
    SET_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA,
} from "./actions";

const INITIAL_STATE = {
    all: [],
    diagnosticDataDescription: {
        selectedEntry: null,
        error: null,
        shouldShowModal: false,
    },
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
            const { data, error } = payload;
            return {
                ...state,
                diagnosticDataDescription: {
                    selectedEntry: data,
                    error: error,
                    shouldShowModal: true,
                },
            };
        }

        case CLEAR_CURRENTLY_DISPLAYED_APPOINTMENT_DIAGNOSTIC_DATA: {
            return {
                ...state,
                diagnosticDataDescription:
                    INITIAL_STATE.diagnosticDataDescription,
            };
        }
    }

    return state;
};
