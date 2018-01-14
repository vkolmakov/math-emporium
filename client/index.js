import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import reduxThunk from 'redux-thunk';
import attachUtilEventListeners from './util/attachUtilEventListeners';
import { getPublicApplicationSettings } from './util/actions';
import reducers from './reducers';
import { authorizeUser, setUserAuthGroup, setUserEmail,
         recordUserSignin, startUsingAuthToken,
         hasNewUserJustSignedIn, addAuthDataFromCookies,
         cleanupAuthDataFromCookies } from './auth/actions';

import { selectOpenSpot, hasNewUserSelectedOpenSpotBeforeSignIn,
         cleanupSelectedOpenSpotFromLocalStorage,
         retrieveSelectedOpenSpotFromLocalStorage } from './schedulingApp/showSchedule/actions';

import { Router, browserHistory } from 'react-router';
import routes from './routes';
import { redirectTo } from './utils';

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

const token = localStorage.getItem('token');
const authGroup = localStorage.getItem('group');
const email = localStorage.getItem('email');

if (token && authGroup && email) {
    startUsingAuthToken(token);
    store.dispatch(authorizeUser());
    store.dispatch(recordUserSignin());
    store.dispatch(setUserAuthGroup(authGroup));
    store.dispatch(setUserEmail(email));
}

store.dispatch(getPublicApplicationSettings()).then(() => {
    ReactDOM.render(
        <Provider store={store}>
          <Router history={browserHistory} routes={routes} />
        </Provider>,
        document.querySelector('.root'));
});
