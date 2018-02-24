import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import reduxThunk from 'redux-thunk';
import attachUtilEventListeners from './util/attachUtilEventListeners';
import { getAndApplyPublicApplicationStartupSettings } from './util/actions';
import reducers from './reducers';
import { signInUser, hasNewUserJustSignedIn,
         addAuthDataFromCookies, cleanupAuthDataFromCookies } from './auth/actions';

import { selectOpenSpot, hasNewUserSelectedOpenSpotBeforeSignIn,
         cleanupSelectedOpenSpotFromLocalStorage,
         retrieveSelectedOpenSpotFromLocalStorage } from './schedulingApp/showSchedule/actions';

import { Router, browserHistory } from 'react-router';
import routes from './routes';
import { redirectTo, storage } from './utils';

import 'react-select/dist/react-select.css';
import 'react-datepicker/dist/react-datepicker.css';
import './style/style.scss';
import './assets/favicon.ico';


let middlewares = [promise, reduxThunk];

if (process.env.NODE_ENV !== 'production') {
    const createLogger = require('redux-logger');
    const logger = createLogger({
        diff: true,
        collapsed: true,
    });

    middlewares = middlewares.concat([logger]);
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducers);

attachUtilEventListeners(window, store);

if (hasNewUserJustSignedIn()) {
    addAuthDataFromCookies();
    redirectTo('/schedule/show');
    if (hasNewUserSelectedOpenSpotBeforeSignIn()) {
        const selectedOpenSpot = retrieveSelectedOpenSpotFromLocalStorage();
        store.dispatch(selectOpenSpot(selectedOpenSpot));
    }
}

cleanupAuthDataFromCookies();
cleanupSelectedOpenSpotFromLocalStorage();

const authGroup = storage.get(storage.KEYS.USER_AUTH_GROUP);
const email = storage.get(storage.KEYS.USER_EMAIL);

if (authGroup && email) {
    store.dispatch(signInUser(authGroup, email));
} else {
    storage.clear();
}

store.dispatch(getAndApplyPublicApplicationStartupSettings()).then(() => {
    ReactDOM.render(
        <Provider store={store}>
          <Router history={browserHistory} routes={routes} />
        </Provider>,
        document.querySelector('.root'));
});
