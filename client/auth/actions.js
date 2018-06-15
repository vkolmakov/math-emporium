import axios from "axios";
import { BASE_URL } from "./constants";
import { parseCookies, cleanCookies, storage } from "../utils";

export const AUTH_USER = "AUTH_USER";
export const UNAUTH_USER = "UNAUTH_USER";
export const AUTH_ERROR = "AUTH_ERROR";
export const CLEAR_AUTH_ERROR = "CLEAR_AUTH_ERROR";
export const SIGNUP_USER = "SIGNUP_USER";
export const RESEND_ACTIVATION_EMAIL = "RESEND_ACTIVATION_EMAIL";
export const SET_USER_GROUP = "SET_USER_GROUP";
export const SET_USER_EMAIL = "SET_USER_EMAIL";
export const RECORD_USER_SIGNIN = "RECORD_USER_SIGNIN";

function persistUserSessionInformation({ group, email }) {
    storage.set(storage.KEYS.USER_AUTH_GROUP, group);
    // replace in case an encoded value comes from a cookie
    storage.set(storage.KEYS.USER_EMAIL, email.replace("%40", "@"));
}

function authCookieKeys() {
    return ["group", "email"];
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

function removeLegacyJwtAuthData() {
    // TODO: this and its usages could be safely removed
    // in a couple of months from the moment it was added
    axios.defaults.headers.common["Authorization"] = null;
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("group");
    window.localStorage.removeItem("email");
}

export function signoutUser() {
    return (dispatch) => {
        return axios
            .post(`${BASE_URL}/signout`)
            .then(() => {
                removeLegacyJwtAuthData();
                cleanupAuthDataFromCookies();
                storage.clear();
            })
            .then(() => dispatch({ type: UNAUTH_USER }));
    };
}

export function signInUser(authGroup, email) {
    function setUserAuthGroup(authGroup) {
        return {
            type: SET_USER_GROUP,
            payload: authGroup,
        };
    }

    function setUserEmail(email) {
        return {
            type: SET_USER_EMAIL,
            payload: email,
        };
    }

    function authorizeUser() {
        return {
            type: AUTH_USER,
        };
    }

    function recordUserSignin() {
        return (dispatch) => {
            const dispatchSigninAction = (recordSigninResult) => ({
                type: RECORD_USER_SIGNIN,
                payload: recordSigninResult,
            });

            const dispatchSignoutAction = (error) => {
                dispatch(signoutUser());
                return { type: RECORD_USER_SIGNIN, payload: error };
            };

            return axios
                .post(`${BASE_URL}/record-signin`)
                .then(dispatchSigninAction, dispatchSignoutAction);
        };
    }

    return (dispatch) => {
        dispatch(authorizeUser());
        dispatch(setUserAuthGroup(authGroup));
        dispatch(setUserEmail(email));
        return dispatch(recordUserSignin());
    };
}

export function hasNewUserJustSignedIn() {
    const cookieKeys = authCookieKeys();
    const cookies = parseCookies(cookieKeys, document.cookie);
    return cookieKeys.every((k) => k in cookies);
}

export function addAuthDataFromCookies() {
    const parsedCookies = parseCookies(authCookieKeys(), document.cookie);
    persistUserSessionInformation(parsedCookies);
}

export function cleanupAuthDataFromCookies() {
    const setCookie = (newCookie) => {
        document.cookie = newCookie;
    };
    cleanCookies(authCookieKeys(), document.cookie).forEach(setCookie);
}
