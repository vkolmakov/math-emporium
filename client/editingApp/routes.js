import React from 'react';
import { Route, IndexRoute } from 'react-router';

import EditingApp from './editingApp.component';
import EditingAppMenu from './menu/editingAppMenu.component';
import EditLocations from './locations/index';
import EditCourses from './courses/index';
import EditTutors from './tutors/index';
import EditSchedules from './editSchedules.component';

export default(
    <Route path="edit-schedule" component={EditingApp}>
      <IndexRoute component={EditingAppMenu} />
      <Route path="locations" component={EditLocations} />
      <Route path="courses" component={EditCourses} />
      <Route path="tutors" component={EditTutors} />
      <Route path="schedules" component={EditSchedules} />
    </Route>
);
