export const BASE_PATH = 'edit-schedule';

export const GOOGLE_CALENDAR_COLORS = [{
    value: '9',
    name: 'Bold Blue',
    color: '#5484ed',
}, {
    value: '1',
    name: 'Blue',
    color: '#a4bdfc',
}, {
    value: '7',
    name: 'Turquoise',
    color: '#46d6db',
}, {
    value: '2',
    name: 'Green',
    color: '#7ae7bf',
}, {
    value: '10',
    name: 'Bold Green',
    color: '#51b749',
}, {
    value: '5',
    name: 'Yellow',
    color: '#fbd75b',
}, {
    value: '6',
    name: 'Orange',
    color: '#ffb878',
}, {
    value: '4',
    name: 'Red',
    color: '#ff887c',
}, {
    value: '11',
    name: 'Bold Red',
    color: '#dc2127',
}, {
    value: '3',
    name: 'Purple',
    color: '#dbadff',
}, {
    value: '8',
    name: 'Gray',
    color: '#e1e1e1',
}];

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
