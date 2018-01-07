import { WINDOW_RESIZE, ROUTE_CHANGE } from './actions';
import { SCREEN_SIZE } from '../constants';

function isDesktop(w) {
    return w.innerWidth >= SCREEN_SIZE.MEDIUM;
}

const INITIAL_UTIL_STATE = {
    isDesktop: isDesktop(window),
    currentRouterPath: '',
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
    case WINDOW_RESIZE:
        return { ...state, isDesktop: isDesktop(action.payload.window) };
    case ROUTE_CHANGE:
        return { ...state, currentRouterPath: action.payload.path };
    default:
        return state;
    }
}
