import React from 'react';

import Route from '@client/routing/Route';
import Switch from '@client/routing/Switch';

import { ROUTE_BASE_PATHS } from '@client/constants';

import Signin from './components/signin';
import Signout from './components/signout';

const BASE_PATH = ROUTE_BASE_PATHS.AUTH;

export default () => (
    <Switch>
      <Route exact path={`/${BASE_PATH}/signin`} component={Signin}></Route>
      <Route exact path={`/${BASE_PATH}/signout`} component={Signout}></Route>
    </Switch>
);
