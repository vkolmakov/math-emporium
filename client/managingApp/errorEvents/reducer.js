import { GET_ERROR_EVENTS } from './actions';

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
    case GET_ERROR_EVENTS:
        return {
            ...state,
            all: payload,
        };
    }

    return state;
};
