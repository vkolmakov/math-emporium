import axios from 'axios';

export const GET_SCHEDULES = 'GET_SCHEDULES';
export const CREATE_SCHEDULE = 'CREATE_SCHEDULE';
export const DELETE_SCHEDULE = 'DELETE_SCHEDULE';

const BASE_URL = '/api/private/schedules';

export function getSchedules() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_SCHEDULES,
        payload: request,
    };
}

export function deleteSchedule(id) {
    const request = axios.delete(`${BASE_URL}/${id}`);

    return {
        type: DELETE_SCHEDULE,
        payload: request,
    };
}

export function createSchedule(data) {
    const requestData = {
        time: data.time,
        weekday: data.weekday,
        location: { id: data.location },
        tutors: data.tutors.map(tutor => ({ id: tutor.value })),
    };

    const request = axios.post(BASE_URL, requestData);

    return {
        type: CREATE_SCHEDULE,
        payload: request,
    };
}
