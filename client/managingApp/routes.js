import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { BASE_PATH } from './constants';

import ManagingApp from './index';

import ManageUsers from './users/index';

export default (
    <Route path={BASE_PATH} component={ManagingApp}>
      <Route path="users" component={ManageUsers} />
    </Route>
);
