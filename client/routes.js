import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './rootApp/index';
import Home from './rootApp/components/home/index';

import EditingAppRoutes from './editingApp/routes';
import AuthRoutes from './auth/routes';
import SchedulingAppRoutes from './schedulingApp/routes';
import ManagingAppRoutes from './managingApp/routes';

export default(
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      {EditingAppRoutes}
      {AuthRoutes}
      {SchedulingAppRoutes}
      {ManagingAppRoutes}
    </Route>
);
