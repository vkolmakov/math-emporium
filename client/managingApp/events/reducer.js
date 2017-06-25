import { GET_EVENTS } from './actions';

const INITIAL_STATE = {
    all: [],
};

function processEvent(event) {
    return {
        type: event.type,
        user: event.user.email,
        time: event.createdAt,
        data: event.data
            ? `${event.data.location.name}: ${event.data.course.code}`
            : '',
    };
}

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
    case GET_EVENTS:
        return {
            ...state,
            all: payload.data.map(processEvent),
        };
    }

    return state;
};
