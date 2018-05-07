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

    createAppointment(user, completeAppointmentData) {
        const createGoogleCalendarAppointment = ({ location, course, tutor, comments, time }) => {
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

        const saveAppointment = ({ googleCalendarAppointmentId, time, location, subject, course, tutor }) => {
            const googleCalendarAppointmentDate = time;
            const googleCalendarId = location.calendarId;

            const appointment = mainStorage.db.models.scheduledAppointment.build({
                userId: user.id,
                subjectId: subject.id,
                courseId: course.id,
                locationId: location.id,
                tutorId: tutor.id,
                googleCalendarAppointmentId,
                googleCalendarAppointmentDate,
                googleCalendarId,
            });
            return appointment.save();
        };

        const { subject, course, location, tutor, time, comments } = completeAppointmentData;

        return createGoogleCalendarAppointment({ location, course, tutor, comments, time })
            .then((result) => saveAppointment({
                googleCalendarAppointmentId: result.id,
                time,
                location,
                subject,
                course,
                tutor,
            }));
    },
});
