import axios from 'axios';
import moment from 'moment';

import { TIMESTAMP_DISPLAY_FORMAT } from '../constants';

export const GET_EVENTS = 'GET_EVENTS';

const BASE_URL = '/api/events/latest';

function processEvent(event) {
    const _time = moment(event.createdAt);

    return {
        id: event._id, // used to set key for each item
        type: event.type,
        user: event.user.email,
        time: _time.format(TIMESTAMP_DISPLAY_FORMAT),
        data: event.data
            ? `${event.data.location.name}: ${event.data.course.code}`
            : '',
    };
}

export function getEvents(count) {
    return (dispatch) => axios.get(BASE_URL, { params: { count } }).then(res => {
        dispatch({
            type: GET_EVENTS,
            payload: res.data.map(processEvent),
        });
    });
}
