import axios from 'axios';
import { browserHistory } from 'react-router';

export const AUTH_USER = 'AUTH_USER';
export const UNAUTH_USER = 'UNAUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const SIGNUP_USER = 'SIGNUP_USER';
export const RESEND_ACTIVATION_EMAIL = 'RESEND_ACTIVATION_EMAIL';

const BASE_URL = '/api/auth';

function addTokenAndGroup({ token, group }) {
    localStorage.setItem('token', token);
    localStorage.setItem('group', group);
    axios.defaults.headers.common['Authorization'] = token;
}

function removeTokenAndGroup() {
    localStorage.removeItem('token');
    localStorage.removeItem('group');
    axios.defaults.headers.common['Authorization'] = null;
}

export function authError(error) {
    return {
        type: AUTH_ERROR,
        payload: error,
    };
}

export function clearAuthError() {
    return {
        type: CLEAR_AUTH_ERROR,
    };
}

export function signinUser({ email, password }) {
    return dispatch => {
        return axios.post(`${BASE_URL}/signin`, { email, password })
            .then(response => {
                dispatch({ type: AUTH_USER });
                addTokenAndGroup(response.data);
                browserHistory.push('/');
            })
            .catch(() => {
                dispatch(authError('Bad login info or an account that\'s not activated'));
            });
    };
}

export function signoutUser() {
    removeTokenAndGroup();
    return {
        type: UNAUTH_USER,
    };
}

export function signupUser({ email, password }) {
    return dispatch => {
        return axios.post(`${BASE_URL}/signup`, { email, password });
    };
}

export function activateUser({ activationToken }) {
    return dispatch => {
        axios.post(`${BASE_URL}/activate`, { token: activationToken })
            .then(response => {
                dispatch({ type: AUTH_USER });
                addTokenAndGroup(response.data.token);
                browserHistory.push('/');
            })
            .catch(response => {
                dispatch(authError(response.data.error));
            });
    };
}

export function resendActivationEmail({ email }) {
    return dispatch => {
        return axios.post(`${BASE_URL}/resend-activation-email`, { email });
    };
}
