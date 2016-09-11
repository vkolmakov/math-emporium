import axios from 'axios';

export const GET_SCHEDULES = 'GET_SCHEDULES';
export const CREATE_SCHEDULE = 'CREATE_SCHEDULE';
export const DELETE_SCHEDULE = 'DELETE_SCHEDULE';
export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE';
export const SET_CURRENT_WEEKDAY = 'SET_CURRENT_WEEKDAY';

const BASE_URL = '/api/schedules';

export function getSchedules() {
    const request = axios.get(BASE_URL);

    return {
        type: GET_SCHEDULES,
        payload: request,
    };
}

export function updateSchedule(id, data) {
    const requestData = {
        time: data.time,
        weekday: data.weekday,
        location: { id: data.location },
        tutors: data.tutors.map(tutor => ({ id: tutor.value })),
    };

    const request = axios.put(`${BASE_URL}/${id}`, requestData);

    return {
        type: UPDATE_SCHEDULE,
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
    const requestData = data.time.map(time => ({
        time: time.value,
        weekday: data.weekday,
        location: { id: data.location },
        tutors: data.tutors.map(tutor => ({ id: tutor.value })),
    }));

    const request = axios.post(BASE_URL, requestData);

    return {
        type: CREATE_SCHEDULE,
        payload: request,
    };
}

export function setCurrentWeekday(weekday) {
    return {
        type: SET_CURRENT_WEEKDAY,
        payload: weekday,
    };
}
