import moment from 'moment';

import { SA_GET_OPEN_SPOTS,
         SA_SET_START_DATE,
         SA_RESET_OPEN_SPOTS,
         SA_SCHEDULING_MESSAGE,
         SA_CLEAR_SCHEDULING_MESSAGE } from './actions';

const INITIAL_STATE = {
    startDate: moment().isoWeekday() > 6 // check if it's Sunday
        ? moment().add(1, 'days').startOf('isoWeek') // if it is, go to next week
        : moment().startOf('isoWeek'), // otherwise stay on the current week
    openSpots: [],
    message: null,
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {
    case SA_GET_OPEN_SPOTS:
        return {
            ...state,
            openSpots: payload.data,
        };

    case SA_SET_START_DATE:
        // expect a moment object
        return {
            ...state,
            startDate: payload.startOf('isoWeek'),
            openSpots: [],
        };

    case SA_RESET_OPEN_SPOTS:
        return {
            ...state,
            openSpots: [],
        };

    case SA_SCHEDULING_MESSAGE:
        return {
            ...state,
            message: payload,
        };

    case SA_CLEAR_SCHEDULING_MESSAGE:
        return {
            ...state,
            message: null,
        };

    default:
        return state;
    }
};
