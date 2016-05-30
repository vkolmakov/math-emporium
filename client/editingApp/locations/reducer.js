import { GET_LOCATIONS, SET_CURRENT_LOCATION } from './actions';

const INITIAL_STATE = {
    all: [],
    location: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_LOCATIONS:
        return { ...state, all: action.payload.data };
    case SET_CURRENT_LOCATION:
        return { ...state, location: action.payload };
    default:
        return state;
    }
};
