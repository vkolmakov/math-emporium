import { WINDOW_RESIZE, ROUTE_CHANGE } from './actions';
import { SCREEN_SIZE } from '../constants';

const INITIAL_UTIL_STATE = {
    currentRouterPath: '',
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
    case ROUTE_CHANGE:
        return { ...state, currentRouterPath: action.payload.path };
    default:
        return state;
    }
}
