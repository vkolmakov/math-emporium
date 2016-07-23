import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import RequireAuth from '../auth/components/requireAuth';

import { BASE_PATH } from './constants';

import SchedulingApp from './index';
import ShowSchedule from './showSchedule/index';
import Profile from './profile/index';

export default (
    <Route path={BASE_PATH} component={SchedulingApp}>
      <IndexRedirect to="show" />
      <Route path="show" component={ShowSchedule} />
      <Route path="profile" component={RequireAuth(Profile)} />
    </Route>
);
