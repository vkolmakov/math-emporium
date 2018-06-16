import axios from "axios";
import moment from "moment";

import { storage } from "../../utils";
import { TIMESTAMP_FORMAT, RANDOM_TUTOR } from "../constants";

export const SA_GET_OPEN_SPOTS = "SA_GET_OPEN_SPOTS";
export const SA_SET_START_DATE = "SA_SET_START_DATE";
export const SA_RESET_OPEN_SPOTS = "SA_RESET_OPEN_SPOTS";
export const SA_SCHEDULE_APPOINTMENT = "SA_SCHEDULE_APPOINTMENT";
export const SA_SCHEDULING_MESSAGE = "SA_SCHEDULING_MESSAGE";
export const SA_CLEAR_SCHEDULING_MESSAGE = "SA_CLEAR_SCHEDULING_MESSAGE";
export const SA_SELECT_OPEN_SPOT = "SA_SELECT_OPEN_SPOT";
export const SA_CLEAR_OPEN_SPOT_SELECTION = "SA_CLEAR_OPEN_SPOT_SELECTION";
export const SA_DISPLAY_TUTOR_SELECTION_MODAL =
    "SA_DISPLAY_TUTOR_SELECTION_MODAL";
export const SA_DISPLAY_LOADING_MODAL = "SA_DISPLAY_LOADING_MODAL";
export const SA_DISPLAY_MESSAGE_MODAL = "SA_DISPLAY_MESSAGE_MODAL";
export const SA_DISPLAY_PROFILE_MODAL = "SA_DISPLAY_PROFILE_MODAL";
export const SA_SAVE_SELECTED_OPEN_SPOT = "SA_SAVE_SELECTED_OPEN_SPOT";

const BASE_URL = "/api/open-spots";
const BASE_URL_APPOINTMENTS = "/api/scheduled-appointments";
const BASE_URL_TUTORS = "/api/available-tutors";

export function getOpenSpots({ location, course, startDate, subject }) {
    const requestParams = {
        locationId: location.id,
        courseId: course.id,
        subjectId: subject.id,
        startDate: startDate.format(TIMESTAMP_FORMAT),
    };

    const request = axios.get(BASE_URL, {
        params: { ...requestParams },
    });

    return {
        type: SA_GET_OPEN_SPOTS,
        payload: request,
    };
}

export function resetOpenSpots() {
    return {
        type: SA_RESET_OPEN_SPOTS,
    };
}

export function setStartDate(date) {
    return {
        type: SA_SET_START_DATE,
        payload: date,
    };
}

export function schedulingMessage(err) {
    return {
        type: SA_SCHEDULING_MESSAGE,
        payload: err,
    };
}

export function clearSchedulingMessage() {
    return {
        type: SA_CLEAR_SCHEDULING_MESSAGE,
    };
}

export function selectOpenSpot({ time, course, location, subject }) {
    return {
        type: SA_SELECT_OPEN_SPOT,
        payload: { time, course, location, subject },
    };
}

export function clearOpenSpotSelection() {
    return {
        type: SA_CLEAR_OPEN_SPOT_SELECTION,
    };
}

export function displayTutorSelectionModal({ tutors, lastActiveElement }) {
    return {
        type: SA_DISPLAY_TUTOR_SELECTION_MODAL,
        payload: {
            tutors,
            lastActiveElement,
        },
    };
}

export function displayLoadingModal() {
    return {
        type: SA_DISPLAY_LOADING_MODAL,
    };
}

export function displayMessageModal({ message, redirectToAfterClosing }) {
    return {
        type: SA_DISPLAY_MESSAGE_MODAL,
        payload: {
            message,
            redirectToAfterClosing,
        },
    };
}

export function displayProfileModal({ lastActiveElement }) {
    return {
        type: SA_DISPLAY_PROFILE_MODAL,
        payload: {
            lastActiveElement,
        },
    };
}

export function scheduleAppointment({
    location,
    subject,
    course,
    time,
    requestedTutor,
    additionalComments,
}) {
    return () => {
        const isRandomTutor = requestedTutor.id === RANDOM_TUTOR.id;
        const tutor = isRandomTutor ? null : requestedTutor;
        const comments = additionalComments || null;

        const requestData = {
            location,
            subject,
            course,
            time: time.toISOString(),
            tutor,
            comments,
        };

        return axios.post(BASE_URL_APPOINTMENTS, requestData);
    };
}

export function getAvailableTutors({ time, course, location, subject }) {
    return () => {
        const requestParams = {
            time: time.format(TIMESTAMP_FORMAT),
            courseId: course.id,
            locationId: location.id,
            subjectId: subject.id,
        };

        return axios.get(BASE_URL_TUTORS, {
            params: { ...requestParams },
        });
    };
}

export function persistPreselectedOpenSpot({
    course,
    location,
    time,
    subject,
}) {
    const serialized = JSON.stringify({
        subject,
        course,
        location,
        time: time.valueOf(),
    });

    storage.set(storage.KEYS.PRESELECTED_OPEN_SPOT, serialized);

    return {
        type: SA_SAVE_SELECTED_OPEN_SPOT,
    };
}

export function didUserPreselectAnOpenSpotBeforeSignIn() {
    return !!storage.get(storage.KEYS.PRESELECTED_OPEN_SPOT);
}

export function retrievePreselectedOpenSpot() {
    const { course, location, time, subject } = JSON.parse(
        storage.get(storage.KEYS.PRESELECTED_OPEN_SPOT),
    );

    return {
        course,
        location,
        subject,
        time: moment(time),
    };
}

export function cleanupPreselectedOpenSpot() {
    return storage.remove(storage.KEYS.PRESELECTED_OPEN_SPOT);
}
