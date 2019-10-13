import { SPD_GET_LOCATIONS, SPD_GET_COURSES } from "./actions";
import { locationComparator, courseComparator } from "../utils";

import Fuse from "fuse.js";

function getCoursesSearchInstance(courses) {
    const COURSES_FUSE_OPTIONS = {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.2,
        location: 0,
        distance: 2,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: ["code", "name"],
    };

    const fuseInstance = new Fuse(courses, COURSES_FUSE_OPTIONS);

    return {
        queryWithMatches(pattern) {
            return (
                fuseInstance
                    .search(pattern, { includeMatches: true })
                    // this will serve as a more-or-less type definition for the
                    // returned object shape and provide a copy of the list.
                    .map(({ item, matches }) => ({ item, matches }))
            );
        },
    };
}

const INITIAL_STATE = {
    locations: { all: [] },
    courses: {
        all: [],
        searcher: {
            queryWithMatches() {
                return [];
            },
        },
    },
};

export default (state = INITIAL_STATE, action) => {
    let sortedCourses = void 0;

    switch (action.type) {
        case SPD_GET_LOCATIONS:
            return {
                ...state,
                locations: {
                    all: action.payload.data.sort(locationComparator),
                },
            };
        case SPD_GET_COURSES:
            sortedCourses = action.payload.data.sort(courseComparator);
            return {
                ...state,
                courses: {
                    all: sortedCourses,
                    searcher: getCoursesSearchInstance([...sortedCourses]),
                },
            };
        default:
            return state;
    }
};
