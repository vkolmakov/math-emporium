import { GET_COURSES } from './actions';

const INITIAL_STATE = {
    all: [],
    course: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_COURSES:
        return { ...state, all: action.payload.data };
    default:
        return state;
    }
};
