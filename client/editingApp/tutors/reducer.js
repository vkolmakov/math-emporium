import { GET_TUTORS, DELETE_TUTOR, CREATE_TUTOR } from './actions';

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_TUTORS:
        return { ...state, all: action.payload.data };
    case DELETE_TUTOR:
        if (action.payload.status == 200) {
            return {
                ...state,
                all: state.all.filter((tutor) => tutor.id != action.payload.data.id),
            };
        }
        return { ...state };
    default:
        return state;
    }
};
