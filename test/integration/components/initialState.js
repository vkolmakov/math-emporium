import moment from 'moment';

import { expandThunksInOrder } from '../utils';

import mainStorage from './mainStorage';
import calendar from './calendar';
import * as data from './data';

const initialState = {
    name: 'initial-state',

    data: {
        subjects: [],
        courses: [],
        tutors: [],
        locations: [],
        tutorCourseLinks: [],
        schedules: [],

        GUARANTEED_ITEMS: {
            LOCATION: null,
            SUBJECT: null,
            COURSE: null,
        },
    },

    _initializeData() {
        // one day distance works for all cases
        // Mo-Sa -> current week is visible and this time is on the current week
        // Su -> next week is visible, and this time is on the next week
        const dayFromNow = moment()
              .startOf('hour')
              .add(1, 'day')
              .toISOString();

        initialState.data.subjects = data.getSubjects();
        initialState.data.courses = data.getCourses();
        initialState.data.tutors = data.getTutors();
        initialState.data.locations = data.getLocations(calendar.testCalendarId);
        initialState.data.tutorCourseLinks = data.getTutorCourseLinks(initialState.data.tutors);
        initialState.data.schedules = data.getSchedules(
            initialState.data.locations,
            initialState.data.tutors,
            [dayFromNow]
        );

        initialState.data.GUARANTEED_ITEMS = data.GUARANTEED_ITEMS;
    },

    async setup() {
        await Promise.all([
            mainStorage.setup(),
            calendar.setup(),
        ]);

        initialState._initializeData();

        await expandThunksInOrder([
            mainStorage.insertRecords(mainStorage.models.Location, initialState.data.locations),
            mainStorage.insertRecords(mainStorage.models.Subject, initialState.data.subjects),
            mainStorage.insertRecords(mainStorage.models.Course, initialState.data.courses),
            mainStorage.insertRecords(mainStorage.models.Tutor, initialState.data.tutors),
            mainStorage.insertTutorCourseLinks(initialState.data.tutorCourseLinks),
        ]);

        await calendar.insertSchedules(initialState.data.schedules);

        return Promise.resolve();
    },

    async teardown() {
        return Promise.all([
            mainStorage.teardown(),
            calendar.teardown(),
        ]);
    },
};

export default initialState;
