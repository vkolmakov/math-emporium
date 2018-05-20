import {
    SA_SET_USER_PROFILE,
    SA_UPDATE_USER_PROFILE,
    SA_SET_ACTIVE_USER_APPOINTMENTS,
} from './actions';

const INITIAL_STATE = {
    user: null,
    activeUserAppointments: null,
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    let data;
    switch (type) {
    case SA_SET_USER_PROFILE:
    case SA_UPDATE_USER_PROFILE: {
        data = payload.data;
        return {
            ...state,
            user: {
                location: data.locationId ? { id: data.locationId } : null,
                course: data.courseId ? { id: data.courseId } : null,
                subject: data.subjectId ? { id: data.subjectId } : null,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
            }
        };
    }
    case SA_SET_ACTIVE_USER_APPOINTMENTS: {
        const activeUserAppointments = payload;

        return {
            ...state,
            activeUserAppointments,
        };
    }
    default: {
        return state;
    }
    }
};
