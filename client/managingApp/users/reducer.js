import { GET_USERS } from './actions';

const INITIAL_STATE = {
    all: [],
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
    case GET_USERS:
        return {
            ...state,
            // stringify booleans so react-select will accept them
            all: payload.data.map(user => ({ ...user, active: JSON.stringify(user.active) })),
        };
    default:
        return state;
    }
};
