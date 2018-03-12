import { expandThunksInOrder } from '../utils';

import mainStorage from './mainStorage';
import calendar from './calendar';
import * as data from './data';

const initialState = {
    name: 'initial-state',

    async setup() {
        await Promise.all([
            mainStorage.setup(),
            calendar.setup(),
        ]);

        await expandThunksInOrder([
            mainStorage.insertRecords(mainStorage.models.Location, data.locations),
            mainStorage.insertRecords(mainStorage.models.Subject, data.subjects),
            mainStorage.insertRecords(mainStorage.models.Course, data.courses),
            mainStorage.insertRecords(mainStorage.models.Tutor, data.tutors),
        ]);

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
