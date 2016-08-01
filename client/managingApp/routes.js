import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RequireAuthGroup from '../auth/components/requireAuthGroup';

import { BASE_PATH, AUTH_GROUPS } from './constants';

import ManagingApp from './index';

import ManageUsers from './users/index';
import UserDetail from './users/components/userDetail';

export default (
    <Route path={BASE_PATH} component={RequireAuthGroup(AUTH_GROUPS.employer)(ManagingApp)}>
      <Route path="users" component={ManageUsers} />
      <Route path="users/:id" component={UserDetail} />
    </Route>
);
