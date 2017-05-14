import React from 'react';
import { Route } from 'react-router';

import Signin from './components/signin';
import Signout from './components/signout';

export default [
    <Route path="signin" component={Signin} key={1}/>,
    <Route path="signout" component={Signout} key={2}/>,
];
