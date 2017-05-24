import { _getAppointments } from '../../../../server/services/appointments/appointments.service.js';


describe('Appointments service', () => {
    const calendarEvents = [{
        summary: 'GeorgeP (John) MATH99',
        start: { dateTime: '2017-05-22T10:00:00-05:00', timeZone: 'America/Chicago' },
        end: { dateTime: '2017-05-22T11:00:00-05:00', timeZone: 'America/Chicago' },
    }, {
        summary: '_3(GeorgeP_Qiqi_SamT)',
        start: { dateTime: '2017-05-22T10:00:00-05:00' },
        end: { dateTime: '2017-05-22T11:00:00-05:00' },
    }, {
        summary: '_3(George_Qiqi_SamT)',
        start: { dateTime: '2017-05-22T11:00:00-05:00' },
        end: { dateTime: '2017-05-22T12:00:00-05:00' },
    }, {
        summary: '_3(Qiqi_SamT)',
        start: { dateTime: '2017-05-22T12:00:00-05:00' },
        end: { dateTime: '2017-05-22T13:00:00-05:00' },
    }, {
        summary: '_3(Qiqi_SamT)',
        start: { dateTime: '2017-05-22T13:00:00-05:00' },
        end: { dateTime: '2017-05-22T14:00:00-05:00' },
    }, {
        summary: 'SamT (Jane) MATH125',
        start: { dateTime: '2017-05-22T13:00:00-05:00', timeZone: 'America/Chicago' },
        end: { dateTime: '2017-05-22T14:00:00-05:00', timeZone: 'America/Chicago' },
    }, {
        summary: 'Qiqi (Jim) MATH209',
        start: { dateTime: '2017-05-22T12:00:00-05:00', timeZone: 'America/Chicago' },
        end: { dateTime: '2017-05-22T13:00:00-05:00', timeZone: 'America/Chicago' },
    }];

    describe('getAppointments', () => {
        const appointments = _getAppointments(calendarEvents);
        const expectedAppointments = [
            { tutor: 'GeorgeP', student: 'John', course: 'MATH99', startDateTime: '2017-05-22-10-00', weekday: 1, time: 600 },
            { tutor: 'SamT', student: 'Jane', course: 'MATH125', startDateTime: '2017-05-22-13-00', weekday: 1, time: 780 },
            { tutor: 'Qiqi', student: 'Jim', course: 'MATH209', startDateTime: '2017-05-22-12-00', weekday: 1, time: 720 },
        ];

        it('finds the correct number of appointments in calendar events', () => {
            expect(appointments).toHaveLength(3);
        });

        it('produces valid appointment objects', () => {
            expectedAppointments.forEach(appointment => {
                expect(appointments).toContainEqual(appointment);
            });
        });
    });
});
