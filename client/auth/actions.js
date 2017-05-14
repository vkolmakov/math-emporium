import axios from 'axios';
import { browserHistory } from 'react-router';
import { BASE_URL } from './constants';
import { parseCookies, cleanCookies } from '../utils';

export const AUTH_USER = 'AUTH_USER';
export const UNAUTH_USER = 'UNAUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const SIGNUP_USER = 'SIGNUP_USER';
export const RESEND_ACTIVATION_EMAIL = 'RESEND_ACTIVATION_EMAIL';
export const SET_USER_GROUP = 'SET_USER_GROUP';
export const SET_USER_EMAIL = 'SET_USER_EMAIL';
export const RECORD_USER_SIGNIN = 'RECORD_USER_SIGNIN';


export function startUsingAuthToken(token) {
    axios.defaults.headers.common['Authorization'] = token;
}

function addAuthData({ token, group, email }) {
    localStorage.setItem('token', token);
    localStorage.setItem('group', group);
    // replace in case an encoded value comes from a cookie
    localStorage.setItem('email', email.replace('%40', '@'));
    startUsingAuthToken(token);
}

function removeAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('group');
    localStorage.removeItem('email');
    axios.defaults.headers.common['Authorization'] = null;
}

function authCookieKeys() {
    return ['token', 'group', 'email'];
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

export function signoutUser() {
    removeAuthData();
    cleanupAuthDataFromCookies();
    return {
        type: UNAUTH_USER,
    };
}

export function setUserAuthGroup(authGroup) {
    return {
        type: SET_USER_GROUP,
        payload: authGroup,
    };
}

export function setUserEmail(email) {
    return {
        type: SET_USER_EMAIL,
        payload: email,
    };
}

export function authorizeUser() {
    return {
        type: AUTH_USER,
    };
}

export function recordUserSignin() {
    return {
        type: RECORD_USER_SIGNIN,
        payload: axios.post(`${BASE_URL}/record-signin`),
    };
}

export function hasNewUserJustSignedIn() {
    const cookieKeys = authCookieKeys();
    const cookies = parseCookies(cookieKeys, document.cookie);
    return cookieKeys.every(k => k in cookies);
}

export function addAuthDataFromCookies() {
    const cookies = parseCookies(authCookieKeys(), document.cookie);
    addAuthData(cookies);
}

export function cleanupAuthDataFromCookies() {
    const setCookie = newCookie => document.cookie = newCookie;
    cleanCookies(authCookieKeys(), document.cookie).forEach(setCookie);
}
