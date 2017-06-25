import { combineReducers } from 'redux';

import usersReducer from './users/reducer';
import eventsReducer from './events/reducer';

const ManagingAppReducers = combineReducers({
    users: usersReducer,
    events: eventsReducer,
});

export default ManagingAppReducers;
