import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { BASE_PATH } from './constants';

import EditingApp from './editingApp.component';
import EditingAppMenu from './menu/editingAppMenu.component';

import EditLocations from './locations/index';
import LocationDetail from './locations/components/locationDetail';

import EditCourses from './courses/index';
import CourseDetail from './courses/components/courseDetail';

import EditTutors from './tutors/index';
import TutorDetail from './tutors/components/tutorDetail';

import EditSchedules from './schedules/index';
import ScheduleDetail from './schedules/components/scheduleDetail';

export default(
    <Route path={BASE_PATH} component={EditingApp}>
      <IndexRoute component={EditingAppMenu} />
      <Route path="locations" component={EditLocations} />
      <Route path="locations/:id" component={LocationDetail} />
      <Route path="courses" component={EditCourses} />
      <Route path="courses/:id" component={CourseDetail} />
      <Route path="tutors" component={EditTutors} />
      <Route path="tutors/:id" component={TutorDetail} />
      <Route path="schedules" component={EditSchedules} />
      <Route path="schedules/:id" component={ScheduleDetail} />
    </Route>
);
