import * as constants from '../constants';

export const BASE_PATH = 'manage-portal';
export const AUTH_GROUPS = constants.AUTH_GROUPS;

export const TIMESTAMP_DISPLAY_FORMAT = constants.TIMESTAMP_DISPLAY_FORMAT;

export const AUTH_GROUPS_OPTIONS = Object.keys(AUTH_GROUPS).map(
    display => ({ value: AUTH_GROUPS[display], display })
);
