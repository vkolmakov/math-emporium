import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './rootApp/index';

import EditingAppRoutes from './editingApp/routes';

export default(
    <Route path="/" component={App}>
      {EditingAppRoutes}
    </Route>
);
