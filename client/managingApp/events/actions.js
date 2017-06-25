import axios from 'axios';

export const GET_EVENTS = 'GET_EVENTS';

const BASE_URL = '/api/events';

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

export function getEvents() {
    return (dispatch) => axios.get(BASE_URL).then(res => {
        dispatch({
            type: GET_EVENTS,
            payload: res.data.map(processEvent),
        });
    });
}
