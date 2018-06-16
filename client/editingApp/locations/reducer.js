import {
    GET_LOCATIONS,
    SET_CURRENT_LOCATION,
    CREATE_LOCATION,
    DELETE_LOCATION,
    UPDATE_LOCATION,
} from "./actions";

const INITIAL_STATE = {
    all: [],
    selected: null,
    error: null,
};

export default (state = INITIAL_STATE, action) => {
    const { payload, type } = action;
    let error;
    switch (type) {
        case GET_LOCATIONS: {
            return { ...state, all: action.payload.data };
        }

        case UPDATE_LOCATION:
        case CREATE_LOCATION: {
            error = action.payload.data.error;
            if (error) {
                return { ...state, error };
            }
            return { ...state, error: null };
        }
        case SET_CURRENT_LOCATION: {
            if (!payload) {
                return {
                    ...state,
                    selected: null,
                };
            }
            let selectedLocation;
            // check if we got an object from select or an actual id
            if (!payload.id) {
                const locationId = parseInt(
                    payload.value ? payload.value : payload,
                    10,
                );
                selectedLocation = state.all.find(
                    (loc) => loc.id === locationId,
                );
            } else {
                selectedLocation = payload;
            }

            return {
                ...state,
                selected: selectedLocation,
            };
        }

        case DELETE_LOCATION: {
            if (action.payload.status === 200) {
                const deletedLocationId = parseInt(action.payload.data.id, 10);
                return {
                    ...state,
                    all: state.all.filter(
                        (location) => location.id !== deletedLocationId,
                    ),
                };
            }
            return { ...state };
        }
        default: {
            return state;
        }
    }
};
