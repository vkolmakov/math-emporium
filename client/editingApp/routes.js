import React from 'react';
import { Route } from 'react-router';

import RequireAuthGroup from '../auth/components/requireAuthGroup';

import { BASE_PATH, AUTH_GROUPS } from './constants';

import EditingApp from './index';

import EditSchedules from './schedules/index';
import ScheduleDetail from './schedules/components/scheduleDetail';

import SchedulesOverview from './overviews/schedules/index';
import TutorsOverview from './overviews/tutors/index';


export default (
    <Route path={BASE_PATH} component={RequireAuthGroup(AUTH_GROUPS.employee)(EditingApp)}>
      <Route path="schedules" component={EditSchedules} />
      <Route path="schedules/:id" component={ScheduleDetail} />
      <Route path="schedules-overview" component={SchedulesOverview} />
      <Route path="tutors-overview" component={TutorsOverview} />
    </Route>
);
