import axios from 'axios';
import moment from 'moment';

import { TIMESTAMP_DISPLAY_FORMAT } from '../constants';

export const GET_ERROR_EVENTS = 'GET_ERROR_EVENTS';

const BASE_URL = '/api/error-events';

function processErrorEvent(errorEvent) {
    return {
        id: errorEvent._id, // used to set key for each item
        type: errorEvent.type,
        user: errorEvent.user.email || 'User was not signed in',
        time: moment(errorEvent.createdAt).format(TIMESTAMP_DISPLAY_FORMAT),
        stacktrace: errorEvent.stacktrace,
        data: !!errorEvent.data
            ? JSON.stringify(errorEvent.data, null, 2)
            : '',
    };
}

export function getErrorEvents(count) {
    return (dispatch) => axios.get(BASE_URL, { params: { count } }).then(res => {
        dispatch({
            type: GET_ERROR_EVENTS,
            payload: res.data.map(processErrorEvent),
        });
    });
}
