import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { BASE_PATH } from './constants';

import SchedulingApp from './index';
import ShowSchedule from './showSchedule/index';
import NextAppointment from './nextAppointment/index';

export default (
    <Route path={BASE_PATH} component={SchedulingApp}>
      <Route path="show" component={ShowSchedule} />
      <Route path="next" component={NextAppointment} />
    </Route>
);
