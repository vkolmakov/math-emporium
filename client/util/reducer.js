import { UT_ROUTE_CHANGE, UT_GET_PUBLIC_SETTINGS } from './actions';

const INITIAL_UTIL_STATE = {
    currentRouterPath: '',
    settings: {
        applicationMainHomePictureLink: '',
        applicationTitle: 'math-emporium',
    },
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
    case UT_ROUTE_CHANGE:
        return { ...state, currentRouterPath: action.payload.path };
    case UT_GET_PUBLIC_SETTINGS:
        if (action.payload instanceof Object) {
            return { ...state, settings: action.payload };
        }
        return state;
    default:
        return state;
    }
}
