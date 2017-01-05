import moment from 'moment';

import { SA_GET_OPEN_SPOTS,
         SA_SET_START_DATE,
         SA_RESET_OPEN_SPOTS,
         SA_SCHEDULING_MESSAGE,
         SA_CLEAR_SCHEDULING_MESSAGE,
         SA_SELECT_OPEN_SPOT,
         SA_CLEAR_OPEN_SPOT_SELECTION } from './actions';

export const MODAL_LIFECYCLE = {
    LOADING: 'LOADING',
    MISSING_PROFILE: 'MISSING_PROFILE',
    SELECTING_TUTOR: 'SELECTING_TUTOR',
};

const INITIAL_STATE = {
    startDate: moment().isoWeekday() > 6 // check if it's Sunday
        ? moment().add(1, 'days').startOf('isoWeek') // if it is, go to next week
        : moment().startOf('isoWeek'), // otherwise stay on the current week
    openSpots: [],
    message: null,
    modalInfo: {
        displayModal: false,
        status: MODAL_LIFECYCLE.LOADING,
    },
    selectedOpenSpotInfo: {
        time: null,
        course: null,
        location: null,
    },
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

    case SA_SELECT_OPEN_SPOT:
        return {
            ...state,
            selectedOpenSpotInfo: { ...payload },
            modalInfo: { displayModal: true, status: MODAL_LIFECYCLE.LOADING },
        };

    case SA_CLEAR_OPEN_SPOT_SELECTION:
        return {
            ...state,
            selectedOpenSpotInfo: {
                displayModal: false,
                time: null,
                course: null,
                location: null,
            },
            modalInfo: { displayModal: false, status: MODAL_LIFECYCLE.LOADING },
        };

    default:
        return state;
    }
};
