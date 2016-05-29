import { combineReducers } from 'redux';
import EditingAppReducers from './editingApp/reducers';

const rootReducer = combineReducers({
    ...EditingAppReducers,
});

export default rootReducer;
