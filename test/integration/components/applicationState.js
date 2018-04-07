import moment from 'moment';

import { expandThunksInOrder } from '../utils';

import mainStorage from './mainStorage';
import calendar from './calendar';
import * as data from './data';

const USER_EMAIL = '';
const USER_PASSWORD = '';

const applicationState = {
    name: 'application-state',

    // will change throughout the course of running tests
    state: {
        appointments: [],
    },

    // should not change over the course of running tests after initialization
    data: {
        subjects: [],
        courses: [],
        tutors: [],
        locations: [],
        tutorCourseLinks: [],
        schedules: [],
        users: [{ email: USER_EMAIL, group: 1, firstName: 'John', lastName: 'Doe' }],

        fakeData: {
            phoneNumber: '12312312345',
        },

        GUARANTEED_ITEMS: {
            LOCATION: null,
            SUBJECT: null,
            COURSE: null,
        },

        USER: {
            email: USER_EMAIL,
            password: USER_PASSWORD,
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

        applicationState.data.GUARANTEED_ITEMS = data.GUARANTEED_ITEMS;
    },

    async setup() {
        await Promise.all([
            mainStorage.setup(),
            calendar.setup(),
        ]);

        applicationState._initializeData();

        await expandThunksInOrder([
            mainStorage.insertRecords(mainStorage.models.User, applicationState.data.users),
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

        const user = await mainStorage.models.User.findOne({ where: { email: applicationState.data.USER.email } });
        return user.update(updatedData);
    },

    async syncAppointmentsFromCalendar() {
        const appointments = await calendar.getAppointments(applicationState.data.schedules);
        applicationState.state.appointments = appointments;
        return Promise.resolve();
    },
};

export default applicationState;
