import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';
import { AUTH_USER } from './auth/actions';

import { Router, browserHistory } from 'react-router';
import routes from './routes';
import axios from 'axios';

import style from './style/style.scss';
import 'react-select/dist/react-select.css';

const createStoreWithMiddleware = applyMiddleware(promise, reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers);
const token = localStorage.getItem('token');

if (token) {
    store.dispatch({ type: AUTH_USER });
    axios.defaults.headers.common['Authorization'] = token;
}

ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory} routes={routes} />
    </Provider>,
    document.querySelector('.root'));
