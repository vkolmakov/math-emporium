import React from 'react';
import { Route } from 'react-router';

import Signin from './components/signin';
import Signout from './components/signout';
import Signup from './components/signup';
import Activate from './components/activate';
import ResendActivationEmail from './components/resendActivationEmail';

export default [
    <Route path="signin" component={Signin} key={1}/>,
    <Route path="signout" component={Signout} key={2}/>,
    <Route path="signup" component={Signup} key={3}/>,
    <Route path="activate" component={Activate} key={4}/>,
    <Route path="activate/:activationToken" component={Activate} key={5}/>,
    <Route path="resend-activation-email" component={ResendActivationEmail} key={6}/>,
];
