import moment from 'moment';

import { expandThunksInOrder } from '../utils';

import mainStorage from './mainStorage';
import calendar from './calendar';
import * as data from './data';

const applicationState = {
    name: 'initial-state',

    data: {
        subjects: [],
        courses: [],
        tutors: [],
        locations: [],
        tutorCourseLinks: [],
        schedules: [],

        fakeData: {
            phoneNumber: '',
        },

        GUARANTEED_ITEMS: {
            LOCATION: null,
            SUBJECT: null,
            COURSE: null,
        },

        USER: {
            email: '',
            password: '',
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

        applicationState.data.subjects = data.getSubjects();
        applicationState.data.courses = data.getCourses();
        applicationState.data.tutors = data.getTutors();
        applicationState.data.locations = data.getLocations(calendar.testCalendarId);
        applicationState.data.tutorCourseLinks = data.getTutorCourseLinks(applicationState.data.tutors);
        applicationState.data.schedules = data.getSchedules(
            applicationState.data.locations,
            applicationState.data.tutors,
            [dayFromNow]
        );

        applicationState.data.fakeData = {
            phoneNumber: data.fakeData.phoneNumber,
        };

        applicationState.data.GUARANTEED_ITEMS = data.GUARANTEED_ITEMS;
    },

    async setup() {
        await Promise.all([
            mainStorage.setup(),
            calendar.setup(),
        ]);

        applicationState._initializeData();

        await expandThunksInOrder([
            mainStorage.insertRecords(mainStorage.models.Location, applicationState.data.locations),
            mainStorage.insertRecords(mainStorage.models.Subject, applicationState.data.subjects),
            mainStorage.insertRecords(mainStorage.models.Course, applicationState.data.courses),
            mainStorage.insertRecords(mainStorage.models.Tutor, applicationState.data.tutors),
            mainStorage.insertTutorCourseLinks(applicationState.data.tutorCourseLinks),
        ]);

        await calendar.insertSchedules(applicationState.data.schedules);

        return Promise.resolve();
    },

    async teardown() {
        return Promise.all([
            mainStorage.teardown(),
            calendar.teardown(),
        ]);
    },

    async setUserState({ shouldHavePhoneNumber }) {
        const updatedData = {};
        updatedData.phone = shouldHavePhoneNumber ? applicationState.data.fakeData.phoneNumber : (void 0);

        const user = await mainStorage.models.User.findOne({ where: { email: applicationState.USER.email } });
        return user.update(updatedData);
    },
};

export default applicationState;
