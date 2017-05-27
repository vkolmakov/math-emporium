import { getOpenSpots,
         getAvailableTutors,
         canTutorCourse,
         buildScheduleMap,
         convertScheduleMapToList } from '../../../../server/services/openSpots/openSpots.service.js';

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
            {
                id: 1,
                name: 'AmyW',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            },
            { id: 2, name: 'PhillipF', courses: [{ id: 2 }] },
            {
                id: 3,
                name: 'HubertF',
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

    describe('buildScheduleMap', () => {
        it('builds a correct simple schedule map', () => {
            const source = [{
                weekday: 1,
                time: 540,
                tutors: [{ id: 1 }, { id: 2 }],
            }, {
                weekday: 1,
                time: 600,
                tutors: [{ id: 2 }],
            }, {
                weekday: 1,
                time: 660,
                tutors: [],
            }, {
                weekday: 2,
                time: 600,
                tutors: [{ id: 2 }],
            }, {
                weekday: 6,
                time: 800,
                tutors: [{ id: 1 }, { id: 2 }, { id: 3 }],
            }];

            const expected = new Map([
                [
                    1,
                    new Map([
                        [540, [{ id: 1 }, { id: 2 }]],
                        [600, [{ id: 2 }]],
                        [660, []],
                    ]),
                ], [
                    2,
                    new Map([
                        [600, [{ id: 2 }]],
                    ]),
                ], [
                    6,
                    new Map([
                        [800, [{ id: 1 }, { id: 2 }, { id: 3 }]],
                    ]),
                ],
            ]);

            expect(buildScheduleMap(x => x, source)).toEqual(expected);
        });

        it('builds a correct schedule map given schedule from locationData', () => {
            const expected = new Map([
                [
                    1,
                    new Map([
                        [540, locationData.schedules[0].tutors],
                        [600, locationData.schedules[1].tutors],
                        [660, locationData.schedules[2].tutors],
                    ]),
                ], [
                    2,
                    new Map([
                        [540, locationData.schedules[3].tutors],
                        [600, locationData.schedules[4].tutors],
                    ]),
                ],
            ]);

            expect(buildScheduleMap(x => x, locationData.schedules)).toEqual(expected);
        });
    });

    describe('convertScheduleMapToList', () => {
        it('properly converts a schedule map to a list', () => {
            const expected = [{
                weekday: 1,
                time: 540,
                tutors: [{ id: 2, name: 'PhillipF' }, { id: 3, name: 'HubertF' }],
            }, {
                weekday: 1,
                time: 600,
                tutors: [{ id: 2, name: 'PhillipF' }, { id: 3, name: 'HubertF' }],
            }, {
                weekday: 1,
                time: 660,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 4, name: 'HermesC' }],
            }, {
                weekday: 2,
                time: 540,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 2, name: 'PhillipF' }],
            }, {
                weekday: 2,
                time: 600,
                tutors: [{ id: 1, name: 'AmyW' }, { id: 2, name: 'PhillipF' }],
            }];

            expected.forEach(
                expectIn(convertScheduleMapToList(buildScheduleMap(x => x, locationData.schedules))));
        });
    });

    describe('canTutorCourse', () => {
        const tutors = locationData.tutors;
        const course1 = { id: 2 };
        const course2 = { id: 3 };

        it('accepts tutor objects that have ids and produces correct result', () => {
            expect(
                tutors.map(t => canTutorCourse(tutors, course1, t))
            ).toEqual([true, true, true, false]);

            expect(
                tutors.map(t => canTutorCourse(tutors, course2, t))
            ).toEqual([true, false, true, false]);
        });

        it('accepts tutor objects that have names and produces correct result', () => {
            expect(
                tutors.map(t => ({ name: t.name })).map(t => canTutorCourse(tutors, course1, t))
            ).toEqual([true, true, true, false]);

            expect(
                tutors.map(t => ({ name: t.name })).map(t => canTutorCourse(tutors, course2, t))
            ).toEqual([true, false, true, false]);
        });

        it('accepts tutor objects with misspelled names and produces correct result', () => {
            expect([
                canTutorCourse(tutors, course1, { name: 'amy' }),
                canTutorCourse(tutors, course1, { name: 'philllipp' }),
                canTutorCourse(tutors, course1, { name: 'hubirTf' }),
                canTutorCourse(tutors, course1, { name: 'hermZ' }),
            ]).toEqual([true, true, true, false]);

            expect([
                canTutorCourse(tutors, course2, { name: 'amy' }),
                canTutorCourse(tutors, course2, { name: 'philllipp' }),
                canTutorCourse(tutors, course2, { name: 'hubirTf' }),
                canTutorCourse(tutors, course2, { name: 'hermZ' }),
            ]).toEqual([true, false, true, false]);
        });
    });

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

    describe('getAvailableTutors', () => {
        it('should return the correct number when there are no appointments or special instructions', () => {
            const parameters = {
                course: { id: 2 },
                weekday: 1,
                time: 660,
            };
            const appointments = [];
            const specialInstructions = [];

            const expected = [{
                id: 1,
                name: 'AmyW',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            }];

            const result = getAvailableTutors(
                locationData, [], [], parameters);

            expected.forEach(expectIn(result));
        });

        it('should return the correct number of tutors with just appointments', () => {
            const parameters = {
                course: { id: 2 },
                weekday: 1,
                time: 540,
            };
            const appointments = [{
                tutor: 'PhillipF',
                student: 'Zoidberg',
                course: 'MATH101',
                startDateTime: '2017-05-29-09-00',
                weekday: 1,
                time: 540,
            }];
            const specialInstructions = [];

            const expected = [{
                id: 3,
                name: 'HubertF',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            }];

            const result = getAvailableTutors(
                locationData, appointments, specialInstructions, parameters);

            expected.forEach(expectIn(result));
        });

        it('should return the correct number of tutors with just special instructions', () => {
            const parameters = {
                course: { id: 2 },
                weekday: 2,
                time: 600,
            };
            const appointments = [];
            const specialInstructions = [{
                overwriteTutors: [{ name: 'AmyW' }, { name: 'HubertF' }],
                startDateTime: '2017-05-30-11-00',
                weekday: 2,
                time: 600,
            }];

            const expected = [{
                id: 1,
                name: 'AmyW',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            }, {
                id: 3,
                name: 'HubertF',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            }];

            const result = getAvailableTutors(
                locationData, appointments, specialInstructions, parameters);

            expected.forEach(expectIn(result));
        });

        it('should return the correct number of tutors with both appointments and special instructions', () => {
            const parameters = {
                course: { id: 2 },
                weekday: 2,
                time: 600,
            };
            const appointments = [{
                tutor: 'AmyW',
                student: 'Zoidberg',
                course: 'MATH101',
                startDateTime: '2017-05-29-09-00',
                weekday: 2,
                time: 600,
            }];
            const specialInstructions = [{
                overwriteTutors: [{ name: 'AmyW' }, { name: 'HubertF' }],
                startDateTime: '2017-05-30-11-00',
                weekday: 2,
                time: 600,
            }];

            const expected = [{
                id: 3,
                name: 'HubertF',
                courses: [{ id: 4 }, { id: 3 }, { id: 2 }],
            }];

            const result = getAvailableTutors(
                locationData, appointments, specialInstructions, parameters);

            expected.forEach(expectIn(result));
        });
    });
});
