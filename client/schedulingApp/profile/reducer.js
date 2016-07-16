import { SA_GET_USER_PROFILE,
         SA_UPDATE_USER_PROFILE } from './actions';

const INITIAL_STATE = null;

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {
    case SA_GET_USER_PROFILE:
        const {
            locationId,
            courseId,
            nextAppointment,
            firstName,
            lastName,
        } = payload.data;

        return {
            location: { id: locationId },
            course: { id: courseId },
            nextAppointment,
            firstName,
            lastName,
        };

    case SA_UPDATE_USER_PROFILE:
        return {
            ...state,
        };

    default:
        return state;
    }
};
