import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { BASE_PATH } from './constants';

import ManagingApp from './index';

import ManageUsers from './users/index';
import UserDetail from './users/components/userDetail';

export default (
    <Route path={BASE_PATH} component={ManagingApp}>
      <Route path="users" component={ManageUsers} />
      <Route path="users/:id" component={UserDetail} />
    </Route>
);
