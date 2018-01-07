import { SA_SET_USER_PROFILE,
         SA_UPDATE_USER_PROFILE } from './actions';

const INITIAL_STATE = null;

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    let data;
    switch (type) {
    case SA_SET_USER_PROFILE:
        data = payload.data;
        return {
            location: data.locationId ? { id: data.locationId } : null,
            course: data.courseId ? { id: data.courseId } : null,
            subject: data.subjectId ? { id: data.subjectId } : null,
            firstName: data.firstName,
            lastName: data.lastName,
            googleCalendarAppointmentDate: data.googleCalendarAppointmentDate,
        };

    case SA_UPDATE_USER_PROFILE:
        data = payload.data;
        return {
            ...state,
            location: data.locationId ? { id: data.locationId } : null,
            course: data.courseId ? { id: data.courseId } : null,
            subject: data.subjectId ? { id: data.subjectId } : null,
            firstName: data.firstName,
            lastName: data.lastName,
        };

    default:
        return state;
    }
};
