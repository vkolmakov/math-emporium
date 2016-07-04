import axios from 'axios';
import { browserHistory } from 'react-router';

export const AUTH_USER = 'AUTH_USER';
export const UNAUTH_USER = 'UNAUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';

const BASE_URL = '/api/public';

function addToken(token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = token;
}

function removeToken() {
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = null;
}

export function authError(error) {
    return {
        type: AUTH_ERROR,
        payload: error,
    };
}

export function signinUser({ email, password }) {
    return dispatch => {
        axios.post(`${BASE_URL}/signin`, { email, password })
            .then(response => {
                dispatch({ type: AUTH_USER });
                addToken(response.data.token);
                browserHistory.push('/');
            })
            .catch(() => {
                dispatch(authError('Bad login info or an account that\'s not activated'));
            });
    };
}

export function signoutUser() {
    removeToken();
    return {
        type: UNAUTH_USER,
    };
}

export function signupUser({ email, password }) {
    return dispatch => {
        axios.post(`${BASE_URL}/signup`, { email, password })
            .then(response => {
                browserHistory.push('/activate');
            })
            .catch(response => {
                dispatch(authError(response.data.error));
            });
    };
}

export function activateUser({ activationToken }) {
    return dispatch => {
        axios.post(`${BASE_URL}/activate`, { token: activationToken })
            .then(response => {
                dispatch({ type: AUTH_USER });
                addToken(response.data.token);
                browserHistory.push('/');
            })
            .catch(response => {
                dispatch(authError(response.data.error));
            });
    };
}
