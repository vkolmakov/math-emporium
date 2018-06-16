import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import promise from "redux-promise";
import reduxThunk from "redux-thunk";
import attachUtilEventListeners from "./util/attachUtilEventListeners";
import { getAndApplyPublicApplicationStartupSettings } from "./util/actions";
import reducers from "./reducers";
import {
    signInUser,
    hasNewUserJustSignedIn,
    addAuthDataFromCookies,
    cleanupAuthDataFromCookies,
} from "./auth/actions";

import {
    selectOpenSpot,
    didUserPreselectAnOpenSpotBeforeSignIn,
    cleanupPreselectedOpenSpot,
    retrievePreselectedOpenSpot,
} from "./schedulingApp/showSchedule/actions";

import Router from "./routing/Router";
import { storage } from "./utils";

import "react-select/dist/react-select.css";
import "react-datepicker/dist/react-datepicker.css";
import "./style/style.scss";
import "./assets/favicon.ico";

let middlewares = [promise, reduxThunk];

if (process.env.NODE_ENV !== "production") {
    const createLogger = require("redux-logger");
    const logger = createLogger({
        diff: true,
        collapsed: true,
    });

    middlewares = middlewares.concat([logger]);
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducers);

attachUtilEventListeners(window, store);

let immediateRedirect = null;
if (hasNewUserJustSignedIn()) {
    addAuthDataFromCookies();
    immediateRedirect = "/schedule/show";
    if (didUserPreselectAnOpenSpotBeforeSignIn()) {
        const preselectedOpenSpot = retrievePreselectedOpenSpot();
        store.dispatch(selectOpenSpot(preselectedOpenSpot));
    }
}

cleanupAuthDataFromCookies();
cleanupPreselectedOpenSpot();

const authGroup = storage.get(storage.KEYS.USER_AUTH_GROUP);
const email = storage.get(storage.KEYS.USER_EMAIL);

const isPotentiallySignedIn = !!authGroup && !!email;

Promise.all([
    isPotentiallySignedIn
        ? store.dispatch(signInUser(authGroup, email))
        : Promise.resolve(),
    store.dispatch(getAndApplyPublicApplicationStartupSettings()),
]).then(([authActionResult]) => {
    if (isPotentiallySignedIn && authActionResult.payload.status !== 200) {
        immediateRedirect = "/auth/signin";
    }

    ReactDOM.render(
        <Provider store={store}>
            <Router immediatelyRedirectTo={immediateRedirect} />
        </Provider>,
        document.querySelector(".root"),
    );
});
