import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";

import EditingAppReducers from "./editingApp/reducers";
import schedulingAppReducers from "./schedulingApp/reducers";
import managingAppReducers from "./managingApp/reducers";

import authReducer from "./auth/reducer";
import utilReducer from "./util/reducer";

import sharedPublicDataReducer from "./sharedPublicData/reducer";

const rootReducer = combineReducers({
    util: utilReducer,
    form: formReducer,
    ...EditingAppReducers,
    scheduling: schedulingAppReducers,
    managing: managingAppReducers,
    auth: authReducer,
    sharedPublicData: sharedPublicDataReducer,
});

export default rootReducer;
