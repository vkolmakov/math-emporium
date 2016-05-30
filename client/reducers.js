import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import EditingAppReducers from './editingApp/reducers';

const rootReducer = combineReducers({
    form: formReducer,
    ...EditingAppReducers,
});

export default rootReducer;
