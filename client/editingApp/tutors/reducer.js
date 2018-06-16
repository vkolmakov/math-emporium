import {
    GET_TUTORS,
    DELETE_TUTOR,
    CREATE_TUTOR,
    UPDATE_TUTOR,
} from "./actions";

const INITIAL_STATE = {
    all: [],
    error: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_TUTORS: {
            return { ...state, all: action.payload.data };
        }
        case CREATE_TUTOR:
        case UPDATE_TUTOR: {
            const error = action.payload.data.error;
            if (error) {
                return { ...state, error };
            }
            return { ...state, error: null };
        }
        case DELETE_TUTOR: {
            if (action.payload.status === 200) {
                const deletedTutorId = parseInt(action.payload.data.id, 10);
                return {
                    ...state,
                    all: state.all.filter(
                        (tutor) => tutor.id !== deletedTutorId,
                    ),
                };
            }
            return { ...state };
        }
        default: {
            return state;
        }
    }
};
