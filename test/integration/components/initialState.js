import { expandThunksInOrder } from '../utils';

import mainStorage from './mainStorage';
import * as data from './data';

const initialState = {
    name: 'initial-state',

    async setup() {
        await mainStorage.setup();

        await expandThunksInOrder([
            mainStorage.insertRecords(mainStorage.models.Location, data.locations),
            mainStorage.insertRecords(mainStorage.models.Subject, data.subjects),
            mainStorage.insertRecords(mainStorage.models.Course, data.courses),
            mainStorage.insertRecords(mainStorage.models.Tutor, data.tutors),
        ]);

        return Promise.resolve();
    },

    async teardown() {
        mainStorage.teardown();
    },
};

export default initialState;
