import moment from 'moment';

import { SA_GET_OPEN_SPOTS,
         SA_SET_START_DATE,
         SA_RESET_OPEN_SPOTS } from './actions';

const INITIAL_STATE = {
    startDate: moment().startOf('isoWeek'),
    openSpots: [],
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

    default:
        return state;
    }
};
