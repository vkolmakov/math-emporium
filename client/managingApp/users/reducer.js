import { GET_USERS } from "./actions";

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case GET_USERS:
            return {
                ...state,
                all: payload.data,
            };
        default:
            return state;
    }
};
