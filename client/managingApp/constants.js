import * as constants from '../constants';

export const BASE_PATH = 'manage-portal';
export const AUTH_GROUPS = constants.AUTH_GROUPS;

export const ACTIVE_OPTIONS = [
    [JSON.stringify(true), 'yes'],
    [JSON.stringify(false), 'no'],
].map(
    ([value, display]) => ({ value, display })
);

export const AUTH_GROUPS_OPTIONS = Object.keys(AUTH_GROUPS).map(
    display => ({ value: AUTH_GROUPS[display], display })
);
