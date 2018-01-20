import * as constants from '../constants';

export const BASE_PATH = 'manage-portal';
export const AUTH_GROUPS = constants.AUTH_GROUPS;
export const EVENT_TYPES = constants.EVENT_TYPES;

export const TIMESTAMP_FORMAT = constants.TIMESTAMP_FORMAT;
export const TIMESTAMP_DISPLAY_FORMAT = constants.TIMESTAMP_DISPLAY_FORMAT;

export const LATEST_EVENT_LIMIT_DEFAULT = 150;

const EVENT_TYPES_DISPLAY_VALUES = {
    CREATE_APPOINTMENT: 'Create Appointment',
    REMOVE_APPOINTMENT: 'Remove Appointment',
    SIGN_IN: 'Sign In',
};

export const EVENT_TYPES_OPTIONS =
      Object.keys(EVENT_TYPES).map(
          key => ({ value: EVENT_TYPES[key],
                    display: EVENT_TYPES_DISPLAY_VALUES[key] }));
