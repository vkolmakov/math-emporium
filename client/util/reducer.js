import { ROUTE_CHANGE, GET_PUBLIC_SETTINGS } from './actions';

const INITIAL_UTIL_STATE = {
    currentRouterPath: '',
    settings: {
        applicationMainHomePictureLink: '',
        applicationTitle: 'math-emporium',
    },
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
    case ROUTE_CHANGE:
        return { ...state, currentRouterPath: action.payload.path };
    case GET_PUBLIC_SETTINGS:
        return { ...state, settings: action.payload };
    default:
        return state;
    }
}
