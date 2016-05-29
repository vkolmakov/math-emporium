import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './shared/app.component';

import EditingApp from './editingApp/editingApp.component';
import EditingAppMenu from './editingApp/menu/editingAppMenu.component';
import EditLocations from './editingApp/locations/editLocations.component';
import EditCourses from './editingApp/editCourses.component';
import EditTutors from './editingApp/editTutors.component';
import EditSchedules from './editingApp/editSchedules.component';

export default(
    <Route path="/" component={App}>
      <Route path="edit-schedule" component={EditingApp}>
        <IndexRoute component={EditingAppMenu} />
        <Route path="locations" component={EditLocations} />
        <Route path="courses" component={EditCourses} />
        <Route path="tutors" component={EditTutors} />
        <Route path="schedules" component={EditSchedules} />
      </Route>
    </Route>
);
