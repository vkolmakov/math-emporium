import { AUTH_USER,
         UNAUTH_USER,
         AUTH_ERROR,
         CLEAR_AUTH_ERROR,
         SET_USER_GROUP,
         SET_USER_EMAIL} from './actions';

export default (state = {}, action) => {
    switch (action.type) {
    case AUTH_USER:
        return { ...state, authenticated: true, error: '' };
    case UNAUTH_USER:
        return { ...state, authenticated: false };
    case AUTH_ERROR:
        return { ...state, error: action.payload };
    case CLEAR_AUTH_ERROR:
        return { ...state, error: '' };
    case SET_USER_GROUP:
        return { ...state, group: parseInt(action.payload, 10) };
    case SET_USER_EMAIL:
        return { ...state, email: action.payload };
    default: return state;
    }
};
