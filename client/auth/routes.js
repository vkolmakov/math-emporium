import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Signin from './components/signin';
import Signout from './components/signout';
import Signup from './components/signup';

export default [
    <Route path="signin" component={Signin} key={1}/>,
    <Route path="signout" component={Signout} key={2}/>,
    <Route path="signup" component={Signup} key={3}/>,
];
