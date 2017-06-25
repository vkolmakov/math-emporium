import axios from 'axios';
import moment from 'moment';

import { TIMESTAMP_DISPLAY_FORMAT } from '../constants';

export const GET_EVENTS = 'GET_EVENTS';

const BASE_URL = '/api/events';

function processEvent(event) {
    const _time = moment(event.createdAt);
    return {
        type: event.type,
        user: event.user.email,
        _time, // internal moment object, will be used for sorting
        time: _time.format(TIMESTAMP_DISPLAY_FORMAT),
        data: event.data
            ? `${event.data.location.name}: ${event.data.course.code}`
            : '',
    };
}

export function getEvents() {
    return (dispatch) => axios.get(BASE_URL).then(res => {
        dispatch({
            type: GET_EVENTS,
            payload: res.data.map(processEvent).sort((a, b) => b._time - a._time),
        });
    });
}
