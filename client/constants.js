export const TIME_OPTIONS = [
    [9 * 60, '09:00am'],
    [10 * 60, '10:00am'],
    [11 * 60, '11:00am'],
    [12 * 60, '12:00pm'],
    [13 * 60, '1:00pm'],
    [14 * 60, '2:00pm'],
    [15 * 60, '3:00pm'],
    [16 * 60, '4:00pm'],
    [17 * 60, '5:00pm'],
    [18 * 60, '6:00pm'],
    [19 * 60, '7:00pm'],
    [20 * 60, '8:00pm'],
].map(
    ([value, display]) => ({ value, display })
);

export const WEEKDAY_OPTIONS = [
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
].map(
    ([value, display]) => ({ value, display })
);

export const AUTH_GROUPS = {
    user: 1,
    employee: 2,
    employer: 3,
    admin: 4,
};

export const EVENT_TYPES = {
    CREATE_APPOINTMENT: 1,
    REMOVE_APPOINTMENT: 2,
    SIGN_IN: 3,
};

export const SCREEN_SIZE = {
    MEDIUM: 768,
};

export const APP_TITLE = 'Tutoring@Wright';

export const TIMESTAMP_FORMAT = 'YYYY-MM-DD-HH-mm';
export const TIMESTAMP_DISPLAY_FORMAT = 'dddd, M/DD [at] h:mma';
export const USER_EMAIL_REGEX = /.+@(?:student.)?ccc\.edu$/;

export const validateEmail = (email) => !!email.match(USER_EMAIL_REGEX);

export const DERIVE_SCHEDULES_FROM_CALENDAR = true;
