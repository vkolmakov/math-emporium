import { GET_APPOINTMENTS } from "./actions";

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case GET_APPOINTMENTS:
            return {
                ...state,
                all: payload,
            };
    }

    return state;
};
