import { combineReducers } from 'redux';

import ShowScheduleReducer from './showSchedule/reducer';
import ProfileReducer from './profile/reducer';
import { courseComparator } from '../utils';

import { SA_GET_LOCATIONS,
         SA_GET_COURSES,
         SA_SET_LOCATION,
         SA_SET_COURSE } from './actions';

const INITIAL_STATE = {
    locations: {
        selected: null,
        all: [],
    },
    courses: {
        selected: null,
        all: [],
    },
};


const sharedReducer = (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {

    case SA_GET_LOCATIONS:
        return {
            ...state,
            locations: {
                selected: null,
                all: payload.data,
            },
        };

    case SA_GET_COURSES:
        return {
            ...state,
            courses: {
                selected: null,
                all: payload.data.sort(courseComparator),
            },
        };

    case SA_SET_LOCATION:
        // could either come as an object with value from select or as an object with id
        let locationId;
        if (payload) {
            locationId = payload.value ? payload.value : payload.id;
        } else {
            locationId = null;
        }
        const selectedLocation = locationId ? state.locations.all.find(l => l.id === locationId) : null;

        return {
            ...state,
            locations: {
                all: state.locations.all,
                selected: selectedLocation,
            },
        };

    case SA_SET_COURSE:
        let selectedCourse;
        if (!payload) {
            selectedCourse = null;
        } else {
            const courseId = payload.value ? payload.value : payload.id;
            selectedCourse = courseId ? state.courses.all.find(c => c.id === courseId) : null;
        }

        return {
            ...state,
            courses: {
                all: state.courses.all,
                selected: selectedCourse,
            },
        };
    default:
        return state;
    }
};


const SchedulingAppReducers = combineReducers({
    shared: sharedReducer,
    showSchedule: ShowScheduleReducer,
    profile: ProfileReducer,
});

export default SchedulingAppReducers;
