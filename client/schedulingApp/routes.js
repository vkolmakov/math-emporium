import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { BASE_PATH } from './constants';

import SchedulingApp from './index';

export default (
    <Route path={BASE_PATH}>
      <IndexRoute component={SchedulingApp}/>
    </Route>
);
