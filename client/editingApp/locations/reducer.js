import { GET_LOCATIONS } from './actions';

const INITIAL_STATE = {
    all: [],
    location: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_LOCATIONS:
        return { ...state, all: action.payload.data };
    default:
        return state;
    }
};
