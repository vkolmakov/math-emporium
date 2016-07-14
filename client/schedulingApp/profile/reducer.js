import { SA_GET_USER_PROFILE,
         SA_UPDATE_USER_PROFILE } from './actions';

const INITIAL_STATE = {
    location: null,
    course: null,
    nextAppointment: null,
    firstName: null,
    lastName: null,
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {
    case SA_GET_USER_PROFILE:
        return {
            ...state,
            ...payload.data,
        };

    case SA_UPDATE_USER_PROFILE:
        return {
            ...state,
        };

    default:
        return state;
    }
}
