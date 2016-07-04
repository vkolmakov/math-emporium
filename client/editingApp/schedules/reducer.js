import { GET_SCHEDULES,
         DELETE_SCHEDULE,
         SET_CURRENT_WEEKDAY,
         CREATE_SCHEDULE,
         UPDATE_SCHEDULE } from './actions';

const INITIAL_STATE = {
    all: [],
    selectedWeekday: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_SCHEDULES:
        return { ...state, all: action.payload.data };

    case CREATE_SCHEDULE:
    case UPDATE_SCHEDULE:
        const error = action.payload.data.error;
        if (error) {
            return { ...state, error };
        }
        return { ...state, error: null };

    case DELETE_SCHEDULE:
        if (action.payload.status == 200) {
            return {
                ...state,
                all: state.all.filter(schedule => schedule.id != action.payload.data.id),
            };
        }

    case SET_CURRENT_WEEKDAY:
        const weekday = action.payload ? action.payload.value : null;
        return {
            ...state,
            selectedWeekday: weekday,
        };

    default:
        return state;
    }
};
