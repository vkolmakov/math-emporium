import {
    GET_COURSES,
    DELETE_COURSE,
    CREATE_COURSE,
    UPDATE_COURSE,
} from "./actions";
import { GOOGLE_CALENDAR_COLORS } from "../constants";

const INITIAL_STATE = {
    all: [],
    error: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_COURSES:
            // get a matching hex color for styling
            const data = action.payload.data.map((course) => ({
                ...course,
                hexColor: GOOGLE_CALENDAR_COLORS.find(
                    (color) => color.value == course.color,
                ).color,
            }));
            return {
                ...state,
                all: data,
            };

        case CREATE_COURSE:
        case UPDATE_COURSE:
            const error = action.payload.data.error;
            if (error) {
                return { ...state, error };
            }
            return { ...state, error: null };

        case DELETE_COURSE:
            if (action.payload.status === 200) {
                return {
                    ...state,
                    all: state.all.filter(
                        (course) => course.id != action.payload.data.id,
                    ),
                };
            } else {
                return { ...state };
            }
        default:
            return state;
    }
};
