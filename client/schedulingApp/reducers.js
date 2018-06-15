import { combineReducers } from "redux";

import ShowScheduleReducer from "./showSchedule/reducer";
import ProfileReducer from "./profile/reducer";
import {
    courseComparator,
    locationComparator,
    subjectComparator,
} from "../utils";

import {
    SA_GET_LOCATIONS,
    SA_GET_SUBJECTS,
    SA_GET_COURSES,
    SA_SET_LOCATION,
    SA_SET_SUBJECT,
    SA_SET_COURSE,
    SA_INITIALIZE,
} from "./actions";

const INITIAL_STATE = {
    initialized: false,
    locations: {
        selected: null,
        all: [],
    },
    subjects: {
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
        case SA_INITIALIZE:
            return {
                ...state,
                initialized: true,
            };

        case SA_GET_LOCATIONS:
            return {
                ...state,
                locations: {
                    selected: null,
                    all: payload.data.sort(locationComparator),
                },
            };

        case SA_GET_SUBJECTS:
            return {
                ...state,
                subjects: {
                    selected: null,
                    all: payload.data.sort(subjectComparator),
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
            const selectedLocation = locationId
                ? state.locations.all.find((l) => l.id === locationId)
                : null;

            return {
                ...state,
                locations: {
                    all: state.locations.all,
                    selected: selectedLocation,
                },
            };

        case SA_SET_SUBJECT:
            // could either come as an object with value from select or as an object with id
            let subjectId;
            if (payload) {
                subjectId = payload.value ? payload.value : payload.id;
            } else {
                subjectId = null;
            }
            const selectedSubject = subjectId
                ? state.subjects.all.find((s) => s.id === subjectId)
                : null;

            return {
                ...state,
                subjects: {
                    all: state.subjects.all,
                    selected: selectedSubject,
                },
            };

        case SA_SET_COURSE:
            let selectedCourse;
            if (!payload) {
                selectedCourse = null;
            } else {
                const courseId = payload.value ? payload.value : payload.id;
                selectedCourse = courseId
                    ? state.courses.all.find((c) => c.id === courseId)
                    : null;
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
