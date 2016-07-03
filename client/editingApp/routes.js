import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RequireAuth from '../auth/components/requireAuth';

import { BASE_PATH } from './constants';

import EditingApp from './index';

import EditLocations from './locations/index';
import LocationDetail from './locations/components/locationDetail';

import EditCourses from './courses/index';
import CourseDetail from './courses/components/courseDetail';

import EditTutors from './tutors/index';
import TutorDetail from './tutors/components/tutorDetail';

import EditSchedules from './schedules/index';
import ScheduleDetail from './schedules/components/scheduleDetail';

import SchedulesOverview from './overviews/schedules/index';
import TutorsOverview from './overviews/tutors/index';

// <Route path={BASE_PATH} component={RequireAuth(EditingApp)}>
export default (
    <Route path={BASE_PATH} component={EditingApp}>
      <Route path="locations" component={EditLocations} />
      <Route path="locations/:id" component={LocationDetail} />
      <Route path="courses" component={EditCourses} />
      <Route path="courses/:id" component={CourseDetail} />
      <Route path="tutors" component={EditTutors} />
      <Route path="tutors/:id" component={TutorDetail} />
      <Route path="schedules" component={EditSchedules} />
      <Route path="schedules/:id" component={ScheduleDetail} />
      <Route path="schedules-overview" component={SchedulesOverview} />
      <Route path="tutors-overview" component={TutorsOverview} />
    </Route>
);
