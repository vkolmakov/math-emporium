import { combineReducers } from 'redux';

import usersReducer from './users/reducer';

const ManagingAppReducers = combineReducers({
    users: usersReducer,
});

export default ManagingAppReducers;
