import moment from 'moment';
import { Left, Right } from '../../utils';

import { MODAL_LIFECYCLE,
         OPEN_SPOTS_LOADING_MESSAGE } from './constants';

import { SA_GET_OPEN_SPOTS,
         SA_SET_START_DATE,
         SA_RESET_OPEN_SPOTS,
         SA_SCHEDULING_MESSAGE,
         SA_CLEAR_SCHEDULING_MESSAGE,
         SA_SELECT_OPEN_SPOT,
         SA_CLEAR_OPEN_SPOT_SELECTION,
         SA_DISPLAY_TUTOR_SELECTION_MODAL,
         SA_DISPLAY_LOADING_MODAL,
         SA_DISPLAY_MESSAGE_MODAL,
         SA_DISPLAY_PROFILE_MODAL } from './actions';

const INITIAL_STATE = {
    startDate: moment().isoWeekday() > 6 // check if it's Sunday
        ? moment().add(1, 'days').startOf('isoWeek') // if it is, go to next week
        : moment().startOf('isoWeek'), // otherwise stay on the current week
    // Either OpenSpotsErrorMessage [OpenSpot]
    openSpots: Left(OPEN_SPOTS_LOADING_MESSAGE),
    message: '',
    modalInfo: {
        displayModal: false,
        status: MODAL_LIFECYCLE.LOADING,
        redirectToAfterClosing: '',
    },
    selectedOpenSpotInfo: {
        time: null,
        course: null,
        location: null,
        tutors: [],
    },
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {
    case SA_GET_OPEN_SPOTS:
        return {
            ...state,
            openSpots: payload.data.length > 0
                ? Right(payload.data)
                : Left('There are no appointments available for this time.'),
        };

    case SA_SET_START_DATE:
        // expect a moment object
        return {
            ...state,
            startDate: payload.startOf('isoWeek'),
            openSpots: Left(OPEN_SPOTS_LOADING_MESSAGE),
        };

    case SA_RESET_OPEN_SPOTS:
        return {
            ...state,
            openSpots: Left(OPEN_SPOTS_LOADING_MESSAGE),
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
            selectedOpenSpotInfo: { ...state.selectedOpenSpotInfo, ...payload },
            modalInfo: { displayModal: true, status: MODAL_LIFECYCLE.LOADING },
        };

    case SA_CLEAR_OPEN_SPOT_SELECTION:
        return {
            ...state,
            selectedOpenSpotInfo: {
                time: null,
                course: null,
                location: null,
                tutors: [],
            },
            modalInfo: { displayModal: false, status: MODAL_LIFECYCLE.LOADING },
        };

    case SA_DISPLAY_TUTOR_SELECTION_MODAL:
        return {
            ...state,
            modalInfo: { displayModal: true, status: MODAL_LIFECYCLE.SELECTING_TUTOR },
            selectedOpenSpotInfo: { ...state.selectedOpenSpotInfo, tutors: payload },
        };

    case SA_DISPLAY_LOADING_MODAL:
        return {
            ...state,
            modalInfo: { displayModal: true, status: MODAL_LIFECYCLE.LOADING },
        };

    case SA_DISPLAY_MESSAGE_MODAL:
        return {
            ...state,
            message: payload.message,
            modalInfo: {
                displayModal: true,
                status: MODAL_LIFECYCLE.DISPLAYING_MESSAGE,
                redirectToAfterClosing: payload.redirectToAfterClosing,
            },
        };

    case SA_DISPLAY_PROFILE_MODAL:
        return {
            ...state,
            modalInfo: { displayModal: true, status: MODAL_LIFECYCLE.MISSING_PROFILE },
        };

    default:
        return state;
    }
};
