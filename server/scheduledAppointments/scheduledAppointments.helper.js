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

    sendAppointmentCreationConfirmation(completeAppointmentData) {
        const { location, course, tutor, time, user } = completeAppointmentData;

        const formattedTime = time.toISOString();
        const contactInfo = !!location.phone || !!location.email
              ? `Please contact us at ${location.phone || location.email} if you have any questions for us.`
              : '';

        const emailBodyConstructor = () =>
              `Your appointment for ${course.code} with ${tutor.name} on ${formattedTime} in the ${location.name} has been scheduled. ${contactInfo}`;
        const subjectConstructor = () => `Appointment reminder: ${location.name} on ${formattedTime}`;
        return user.sendEmail({ subjectConstructor, emailBodyConstructor });
    },

    createAppointment(completeAppointmentData) {
        const createGoogleCalendarAppointment = ({ user, location, course, tutor, comments, time }) => {
            const calendarId = location.calendarId;

            const startTime = time;
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

        const saveAppointment = ({ user, googleCalendarAppointmentId, time, location, subject, course, tutor }) => {
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

        const { subject, course, location, tutor, time, comments, user } = completeAppointmentData;

        return createGoogleCalendarAppointment({ user, location, course, tutor, comments, time })
            .then((result) => saveAppointment({
                user,
                googleCalendarAppointmentId: result.id,
                time,
                location,
                subject,
                course,
                tutor,
            }));
    },
});
