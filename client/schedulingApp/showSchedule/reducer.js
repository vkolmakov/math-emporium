import moment from 'moment';

import { SA_GET_OPEN_SPOTS,
         SA_GET_LOCATIONS,
         SA_GET_COURSES,
         SA_SET_LOCATION,
         SA_SET_COURSE,
         SA_SET_START_DATE } from './actions';

const INITIAL_STATE = {
    locations: {
        selected: null,
        all: [],
    },
    courses: {
        selected: null,
        all: [],
    },
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

    case SA_GET_LOCATIONS:
        return {
            ...state,
            locations: {
                ...state.locations,
                all: payload.data,
            },
        };

    case SA_GET_COURSES:
        return {
            ...state,
            courses: {
                ...state.courses,
                all: payload.data,
            },
        };

    case SA_SET_LOCATION:
        const selectedLocation = payload ? state.locations.all.find(l => l.id === payload.value) : null;
        return {
            ...state,
            courses: {
                ...state.courses,
                selected: null,
            },
            locations: {
                ...state.locations,
                selected: selectedLocation,
            },
            openSpots: [],
        };

    case SA_SET_COURSE:
        const selectedCourse = payload ? state.courses.all.find(c => c.id === payload.value) : null;
        return {
            ...state,
            courses: {
                ...state.courses,
                selected: selectedCourse,
            },
            openSpots: [],
        };

    case SA_SET_START_DATE:
        // expect a moment object
        return {
            ...state,
            startDate: payload.startOf('isoWeek'),
            openSpots: [],
        };

    default:
        return state;
    }
};
