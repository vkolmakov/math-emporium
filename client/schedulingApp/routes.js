import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import RequireAuthGroup from '../auth/components/requireAuthGroup';

import { BASE_PATH, AUTH_GROUPS } from './constants';

import SchedulingApp from './index';
import ShowSchedule from './showSchedule/index';
import Profile from './profile/index';

export default (
    <Route path={BASE_PATH} component={SchedulingApp}>
      <IndexRedirect to="show" />
      <Route path="show" component={ShowSchedule} />
      <Route path="profile" component={RequireAuthGroup(AUTH_GROUPS.user)(Profile)} />
    </Route>
);
