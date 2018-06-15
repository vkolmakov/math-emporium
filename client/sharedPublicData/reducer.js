import { SPD_GET_LOCATIONS } from "./actions";

import { locationComparator } from "../utils";

const INITIAL_STATE = {
    locations: { all: [] },
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
        default:
            return state;
    }
};
