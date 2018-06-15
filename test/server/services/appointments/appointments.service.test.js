import {
    getAppointments,
    getSpecialInstructions,
} from "../../../../server/services/appointments/appointments.service.js";

const expectIn = (container) => (element) =>
    expect(container).toContainEqual(element);

describe("appointments.service", () => {
    const calendarEvents = [
        {
            summary: "George (John) MATH99",
            start: {
                dateTime: "2017-05-22T10:00:00-05:00",
                timeZone: "America/Chicago",
            },
            end: {
                dateTime: "2017-05-22T11:00:00-05:00",
                timeZone: "America/Chicago",
            },
        },
        {
            summary: "_3(George_Qiqi_SamT)",
            start: { dateTime: "2017-05-22T10:00:00-05:00" },
            end: { dateTime: "2017-05-22T11:00:00-05:00" },
        },
        {
            summary: "_3(George_Qiqi_SamT)",
            start: { dateTime: "2017-05-22T11:00:00-05:00" },
            end: { dateTime: "2017-05-22T12:00:00-05:00" },
        },
        {
            summary: "_3(Qiqi_SamT)",
            start: { dateTime: "2017-05-22T12:00:00-05:00" },
            end: { dateTime: "2017-05-22T13:00:00-05:00" },
        },
        {
            summary: "_3(Qiqi_SamT)",
            start: { dateTime: "2017-05-22T13:00:00-05:00" },
            end: { dateTime: "2017-05-22T14:00:00-05:00" },
        },
        {
            summary: "SamT (Jane) MATH125",
            start: {
                dateTime: "2017-05-22T13:00:00-05:00",
                timeZone: "America/Chicago",
            },
            end: {
                dateTime: "2017-05-22T14:00:00-05:00",
                timeZone: "America/Chicago",
            },
        },
        {
            summary: "Qiqi (Jim) MATH209",
            start: {
                dateTime: "2017-05-22T12:00:00-05:00",
                timeZone: "America/Chicago",
            },
            end: {
                dateTime: "2017-05-22T13:00:00-05:00",
                timeZone: "America/Chicago",
            },
        },
    ];

    describe("getAppointments", () => {
        const appointments = getAppointments(calendarEvents);
        const expectedAppointments = [
            {
                tutor: "George",
                student: "John",
                course: "MATH99",
                startDateTime: "2017-05-22-10-00",
                weekday: 1,
                time: 600,
            },
            {
                tutor: "SamT",
                student: "Jane",
                course: "MATH125",
                startDateTime: "2017-05-22-13-00",
                weekday: 1,
                time: 780,
            },
            {
                tutor: "Qiqi",
                student: "Jim",
                course: "MATH209",
                startDateTime: "2017-05-22-12-00",
                weekday: 1,
                time: 720,
            },
        ];

        it("finds the correct number of appointments in calendar events", () => {
            expect(appointments).toHaveLength(3);
        });

        it("produces valid appointment objects", () => {
            expectedAppointments.forEach(expectIn(appointments));
        });
    });

    describe("getSpecialInstructions", () => {
        const specialInstructions = getSpecialInstructions(calendarEvents);
        const expectedSpecialInstructions = [
            {
                overwriteTutors: [
                    { name: "George" },
                    { name: "Qiqi" },
                    { name: "SamT" },
                ],
                startDateTime: "2017-05-22-10-00",
                weekday: 1,
                time: 600,
            },
            {
                overwriteTutors: [
                    { name: "George" },
                    { name: "Qiqi" },
                    { name: "SamT" },
                ],
                startDateTime: "2017-05-22-11-00",
                weekday: 1,
                time: 660,
            },
            {
                overwriteTutors: [{ name: "Qiqi" }, { name: "SamT" }],
                startDateTime: "2017-05-22-12-00",
                weekday: 1,
                time: 720,
            },
            {
                overwriteTutors: [{ name: "Qiqi" }, { name: "SamT" }],
                startDateTime: "2017-05-22-13-00",
                weekday: 1,
                time: 780,
            },
        ];

        it("finds the correct number of special instructions", () => {
            expect(specialInstructions).toHaveLength(4);
        });

        it("produces correct special instructions objects", () => {
            expectedSpecialInstructions.forEach(expectIn(specialInstructions));
        });
    });
});
