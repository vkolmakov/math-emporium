import { getOpenSpots,
         getAvailableTutors } from '../../../../server/services/openSpots/openSpots.service.js';

const expectIn = container => element => expect(container).toContainEqual(element);

describe('openSpots.service', () => {
    const specialInstructions = [{
        overwriteTutors: [{ name: 'AmyW' }, { name: 'HubertF' }],
        startDateTime: '2017-05-30-11-00',
        weekday: 2,
        time: 660,
    }, {
        overwriteTutors: [{ name: 'AmyW' }],
        startDateTime: '2017-05-29-10-00',
        weekday: 1,
        time: 600,
    }];

    const appointments = [{
        tutor: 'PhillipF',
        student: 'Zoidberg',
        course: 'MATH101',
        startDateTime: '2017-05-29-09-00',
        weekday: 1,
        time: 540,
    }, {
        tutor: 'HubertF',
        student: 'Calculon',
        course: 'MATH101',
        startDateTime: '2017-05-29-09-00',
        weekday: 1,
        time: 540,
    }, {
        tutor: 'AmyW',
        student: 'Blob',
        course: 'MATH201',
        startDateTime: '2017-05-29-10-00',
        weekday: 1,
        time: 600,
    }];

    const locationData = {
        location: { id: 1 },
        courses: [{ id: 2 }, { id: 3 }, { id: 4 }],
        tutors: [
            { id: 2, name: 'PhillipF', courses: [{ id: 2 }] },
            {
                id: 3,
                name: 'HubertF',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            },
            {
                id: 1,
                name: 'AmyW',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            },
            { id: 4, name: 'HermesC', courses: [{ id: 4 }] },
        ],
        schedules: [
            {
                id: 1,
                weekday: 1,
                time: 540,
                tutors: [
                    { id: 2, name: 'PhillipF' },
                    { id: 3, name: 'HubertF' },
                ],
            },
            {
                id: 2,
                weekday: 1,
                time: 600,
                tutors: [
                    { id: 2, name: 'PhillipF' },
                    { id: 3, name: 'HubertF' },
                ],
            },
            {
                id: 3,
                weekday: 1,
                time: 660,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 4, name: 'HermesC' }],
            },
            {
                id: 6,
                weekday: 2,
                time: 540,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 2, name: 'PhillipF' }],
            },
            {
                id: 7,
                weekday: 2,
                time: 600,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 2, name: 'PhillipF' }],
            },
        ],
    };

    describe('getOpenSpots', () => {
        it('should return correct schedule given no appointments or special instructions', () => {
            const parameters = {
                courseId: 2,
            };

            const expected = [
                { weekday: 1, time: 540, count: 2 },
                { weekday: 1, time: 600, count: 2 },
                { weekday: 1, time: 660, count: 1 },
                { weekday: 2, time: 540, count: 2 },
                { weekday: 2, time: 600, count: 2 },
            ];

            const result = getOpenSpots(
                locationData, [], [], parameters
            );

            expected.forEach(expectIn(result));
        });

        it('should draw schedule from locationData only if no special instructions are provided', () => {
            const parameters = {
                courseId: 2,
            };

            const expected = [
                { weekday: 1, time: 540, count: 0 },
                { weekday: 1, time: 600, count: 1 },
                { weekday: 1, time: 660, count: 1 },
                { weekday: 2, time: 540, count: 2 },
                { weekday: 2, time: 600, count: 2 },
            ];

            const result = getOpenSpots(
                locationData, appointments, [], parameters
            );

            expected.forEach(expectIn(result));
        });

        it('should return correct open spots using default schedule and calendar overrides', () => {
            const parameters = {
                courseId: 3,
            };

            const expected = [
                { weekday: 1, time: 540, count: 0 },
                { weekday: 1, time: 600, count: 0 },
                { weekday: 1, time: 660, count: 1 },
                { weekday: 2, time: 540, count: 1 },
                { weekday: 2, time: 600, count: 1 },
            ];

            const result = getOpenSpots(
                locationData, appointments, specialInstructions, parameters
            );

            expected.forEach(expectIn(result));
        });

        it('should return correct open spots using default schedule and calendar overrides for a different course', () => {
            const parameters = {
                courseId: 2,
            };

            const expected = [
                { weekday: 1, time: 540, count: 0 },
                { weekday: 1, time: 600, count: 0 },
                { weekday: 1, time: 660, count: 1 },
                { weekday: 2, time: 540, count: 2 },
                { weekday: 2, time: 600, count: 2 },
            ];

            const result = getOpenSpots(
                locationData, appointments, specialInstructions, parameters
            );

            expected.forEach(expectIn(result));
        });
    });
});
