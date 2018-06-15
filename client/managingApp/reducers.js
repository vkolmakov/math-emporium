import { combineReducers } from "redux";

import usersReducer from "./users/reducer";
import eventsReducer from "./events/reducer";
import errorEventsReducer from "./errorEvents/reducer";
import settingsReducer from "./settings/reducer";

const ManagingAppReducers = combineReducers({
    users: usersReducer,
    events: eventsReducer,
    errorEvents: errorEventsReducer,
    settings: settingsReducer,
});

export default ManagingAppReducers;
