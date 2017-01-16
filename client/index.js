import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';
import { AUTH_USER, SET_USER_GROUP, SET_USER_EMAIL } from './auth/actions';

import createLogger from 'redux-logger';

import { Router, browserHistory } from 'react-router';
import routes from './routes';
import axios from 'axios';

import 'react-select/dist/react-select.css';
import 'react-datepicker/dist/react-datepicker.css';
import './style/style.scss';
import './assets/favicon.ico';


const middlewares = [promise, reduxThunk];

if (process.env.NODE_ENV !== 'production') {
    const logger = createLogger({
        diff: true,
        collapsed: true,
    });

    middlewares.push(logger);
}


const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducers);

const token = localStorage.getItem('token');
const authGroup = localStorage.getItem('group');
const email = localStorage.getItem('email');

if (token && authGroup && email) {
    store.dispatch({ type: AUTH_USER });
    store.dispatch({ type: SET_USER_GROUP, payload: authGroup });
    store.dispatch({ type: SET_USER_EMAIL, payload: email });
    axios.defaults.headers.common['Authorization'] = token;
}

ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory} routes={routes} />
    </Provider>,
    document.querySelector('.root'));
