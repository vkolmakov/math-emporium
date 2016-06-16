import { GET_LOCATIONS,
         SET_CURRENT_LOCATION,
         DELETE_LOCATION } from './actions';

const INITIAL_STATE = {
    all: [],
    selected: null,
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    switch (type) {
    case GET_LOCATIONS:
        return { ...state, all: action.payload.data };
    case SET_CURRENT_LOCATION:
        if (!payload) {
            return {
                ...state,
                selected: null,
            };
        }
        // check if we got an object from select or an actual id
        const locationId = !!payload.value ? payload.value : payload;
        const selectedLocation = state.all.find((loc) => loc.id == locationId);
        return {
            ...state,
            selected: selectedLocation,
        };
    case DELETE_LOCATION:
        if (action.payload.status == 200) {
            return {
                ...state,
                all: state.all.filter(location => location.id != action.payload.data.id),
            };
        }
        return { ...state };
    default:
        return state;
    }
};
