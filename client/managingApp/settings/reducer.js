import { GET_SETTINGS } from './actions';

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_SETTINGS:
        return { ...state, ...action.payload };
    default:
        return state;
    }
};
