import { SPD_GET_LOCATIONS, SPD_GET_COURSES } from "./actions";

import { locationComparator, courseComparator } from "../utils";

const INITIAL_STATE = {
    locations: { all: [] },
    courses: { all: [] },
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SPD_GET_LOCATIONS:
            return {
                ...state,
                locations: {
                    all: action.payload.data.sort(locationComparator),
                },
            };
        case SPD_GET_COURSES:
            return {
                ...state,
                courses: {
                    all: action.payload.data.sort(courseComparator),
                },
            };
        default:
            return state;
    }
};
