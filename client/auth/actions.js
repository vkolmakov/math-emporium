import axios from 'axios';
import { browserHistory } from 'react-router';

export const AUTH_USER = 'AUTH_USER';
export const UNAUTH_USER = 'UNAUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const SIGNUP_USER = 'SIGNUP_USER';
export const RESEND_ACTIVATION_EMAIL = 'RESEND_ACTIVATION_EMAIL';
export const SET_USER_GROUP = 'SET_USER_GROUP';
export const SET_USER_EMAIL = 'SET_USER_EMAIL';

const BASE_URL = '/api/auth';

function addAuthData({ token, group, email }) {
    localStorage.setItem('token', token);
    localStorage.setItem('group', group);
    localStorage.setItem('email', email);
    axios.defaults.headers.common['Authorization'] = token;
}

function removeAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('group');
    localStorage.removeItem('email');
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
    return dispatch =>
        axios.post(`${BASE_URL}/signin`, { email, password }).then(
            response => {
                const { data } = response;
                dispatch({ type: AUTH_USER });
                dispatch({ type: SET_USER_GROUP, payload: data.group });
                dispatch({ type: SET_USER_EMAIL, payload: data.email });
                addAuthData(data);
                browserHistory.push('/schedule/show');
                return Promise.resolve();
            },
            err => {
                dispatch(authError('Bad login info or an account that\'s not activated'))
                return Promise.reject();
            }
        );
}


export function signoutUser() {
    removeAuthData();
    return {
        type: UNAUTH_USER,
    };
}

export function signupUser({ email, password }) {
    return dispatch => axios.post(`${BASE_URL}/signup`, { email, password });
}

export function activateUser({ activationToken }) {
    return dispatch => {
        axios.post(`${BASE_URL}/activate`, { token: activationToken })
            .then(response => {
                const data = response.data;
                dispatch({ type: AUTH_USER });
                dispatch({ type: SET_USER_GROUP, payload: data.group });
                dispatch({ type: SET_USER_EMAIL, payload: data.email });
                addAuthData(data);
                browserHistory.push('/');
            })
            .catch(response => {
                dispatch(authError(response.data.error));
            });
    };
}

export function resendActivationEmail({ email }) {
    return dispatch => axios.post(`${BASE_URL}/resend-activation-email`, { email });
}

export function sendResetPasswordEmail({ email }) {
    return dispatch => axios.post(`${BASE_URL}/send-reset-password-email`, { email });
}

export function resetPassword({ password, token }) {
    return dispatch => axios.post(`${BASE_URL}/reset-password`, { password, token });
}
