import { addMinutes } from 'date-fns';

const APPOINTMENT_LENGTH = 60;

export default (mainStorage, calendarService) => ({
    getExistingActiveAppointments(appointments, now) {
        return [];
    },

    canCreateAppointment(existingAppointments, locations) {
        const isValidRequest = (appointmentData) => {
            // check if valid location / course / subject / tutor
            return true;
        };

        return {
            canCreateAppointment: true,
            reason: '',
        };
    },

    createAppointment(user, appointmentData) {
        const createGoogleCalendarAppointment = (location, course, tutor) => {
            const { time, comments } = appointmentData;

            const calendarId = location.calendarId;

            const startTime = new Date(time);
            const endTime = addMinutes(startTime, APPOINTMENT_LENGTH);

            const summary = user.getAppointmentSummary({
                course,
                tutorData: {
                    wasExplicitlyRequested: true,
                    tutor,
                },
            });
            const description = user.getAppointmentDescription({ course, comments });
            const colorId = course.color;

            return calendarService.createCalendarEvent({
                calendarId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                summary,
                description,
                colorId,
            });
        };

        const { subject, tutor, time, comments } = appointmentData; // shallow objects
        const googleCalendarAppointmentId = 'test';
        const googleCalendarAppointmentDate = time;
        const googleCalendarId = 'test';

        return Promise.all([
            mainStorage.db.models.location.findOne({ where: { id: appointmentData.location.id } }),
            mainStorage.db.models.course.findOne({ where: { id: appointmentData.course.id } }),
            mainStorage.db.models.tutor.findOne({ where: { id: appointmentData.tutor.id } }),
        ]).then(([location, course, tutor]) => {
            return createGoogleCalendarAppointment(location, course, tutor);
        });

        // const appointment = mainStorage.db.models.scheduledAppointment.build({
        //     userId: user.id,
        //     subjectId: subject.id,
        //     courseId: course.id,
        //     locationId: location.id,
        //     tutorId: tutor.id,
        //     googleCalendarAppointmentId,
        //     googleCalendarAppointmentDate,
        //     googleCalendarId,
        // });
        // return appointment.save();
    },
});
