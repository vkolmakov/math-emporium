import React from 'react';
import { Route } from 'react-router';

import RequireAuthGroup from '../auth/components/requireAuthGroup';

import { BASE_PATH, AUTH_GROUPS } from './constants';

import EditingApp from './index';

import EditSubjects from './subjects/index';
import SubjectDetail from './subjects/components/subjectDetail';

import EditCourses from './courses/index';
import CourseDetail from './courses/components/courseDetail';

import EditTutors from './tutors/index';
import TutorDetail from './tutors/components/tutorDetail';

import EditSchedules from './schedules/index';
import ScheduleDetail from './schedules/components/scheduleDetail';

import SchedulesOverview from './overviews/schedules/index';
import TutorsOverview from './overviews/tutors/index';


export default (
    <Route path={BASE_PATH} component={RequireAuthGroup(AUTH_GROUPS.employee)(EditingApp)}>
      <Route path="subjects" component={EditSubjects} />
      <Route path="subjects/:id" component={SubjectDetail} />
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
