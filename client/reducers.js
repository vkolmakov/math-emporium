import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import EditingAppReducers from './editingApp/reducers';
import SchedulingAppReducers from './schedulingApp/reducers';
import authReducer from './auth/reducer';

const rootReducer = combineReducers({
    form: formReducer,
    ...EditingAppReducers,
    ...SchedulingAppReducers,
    auth: authReducer,

});

export default rootReducer;
