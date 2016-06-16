import { GET_SCHEDULES, DELETE_SCHEDULE } from './actions';

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case GET_SCHEDULES:
        return { ...state, all: action.payload.data };
    case DELETE_SCHEDULE:
        if (action.payload.status == 200) {
            return {
                ...state,
                all: state.all.filter(schedule => schedule.id != action.payload.data.id),
            };
        }
    default:
        return state;
    }
};
