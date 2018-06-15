import {
    GET_SUBJECTS,
    DELETE_SUBJECT,
    CREATE_SUBJECT,
    UPDATE_SUBJECT,
} from "./actions";

const INITIAL_STATE = {
    all: [],
    error: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_SUBJECTS:
            // get a matching hex color for styling
            const data = action.payload.data;
            return {
                ...state,
                all: data,
            };

        case CREATE_SUBJECT:
        case UPDATE_SUBJECT:
            const error = action.payload.data.error;
            if (error) {
                return { ...state, error };
            }
            return { ...state, error: null };

        case DELETE_SUBJECT:
            if (action.payload.status === 200) {
                return {
                    ...state,
                    all: state.all.filter(
                        (subject) => subject.id != action.payload.data.id,
                    ),
                };
            } else {
                return { ...state };
            }
        default:
            return state;
    }
};
