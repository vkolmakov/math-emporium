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
    },

    _initializeData() {
        const twoHoursFromNow = moment()
              .startOf('hour')
              .add(2, 'hours')
              .toISOString();

        initialState.data.subjects = data.getSubjects();
        initialState.data.courses = data.getCourses();
        initialState.data.tutors = data.getTutors();
        initialState.data.locations = data.getLocations(calendar.testCalendarId);
        initialState.data.tutorCourseLinks = data.getTutorCourseLinks(initialState.data.tutors);
        initialState.data.schedules = data.getSchedules(
            initialState.data.locations,
            initialState.data.tutors,
            [twoHoursFromNow]
        );
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
