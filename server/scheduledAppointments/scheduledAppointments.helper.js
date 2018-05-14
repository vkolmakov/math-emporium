import { dateTime, APPOINTMENT_LENGTH } from '../aux';


const itemQuantityDescription = (item, quantity) => {
    let result;
    if (quantity === 1) {
        result = `${quantity} ${item}`;
    } else {
        result = `${quantity} ${item}s`;
    }
    return result;
};


export default (mainStorage, calendarService, sendEmail) => ({
    canCreateAppointment(completeAppointmentData, existingAppointments, now) {
        const hasTutor = ({ tutorData }) => ({
            isValid: !!tutorData.tutor,
            error: 'Requested tutor is no longer available',
        });

        const isAfterNow = ({ time }) => ({
            isValid: dateTime.isAfter(time, now),
            error: 'Requested appointment time is no longer available',
        });

        const doesNotExceedLocationMaximum = ({ location }) => {
            const { maximumAppointmentsPerLocation } = location;
            return {
                isValid: false,
                error: `Cannot have more than ${itemQuantityDescription('appointment', maximumAppointmentsPerLocation)} at this location at the same time`,
            };
        };

        const validators = [
            hasTutor,
            isAfterNow,
            doesNotExceedLocationMaximum,
        ];

        const applyValidators = (validators) => {
            const result = validators.reduce((result, validator) => {
                const individualValidationResult = validator(completeAppointmentData);

                return {
                    isValid: result.isValid && individualValidationResult.isValid,
                    accumulatedErrors: !individualValidationResult.isValid
                        ? result.accumulatedErrors.concat([individualValidationResult.error])
                        : result.accumulatedErrors,
                };
            }, { isValid: true, accumulatedErrors: [] });

            return {
                canCreateAppointment: result.isValid,
                reason: result.accumulatedErrors.join('; '),
            };
        };

        return applyValidators(validators);
    },

    sendAppointmentCreationConfirmation(completeAppointmentData) {
        const { location, course, tutorData, time, user } = completeAppointmentData;
        const formattedTime = dateTime.formatVisible(time);
        const contactInfo = !!location.phone || !!location.email
              ? `Please contact us at ${location.phone || location.email} if you have any questions for us.`
              : '';

        const emailBodyConstructor = () =>
              `Your appointment for ${course.code} with ${tutorData.tutor.name} on ${formattedTime} in the ${location.name} has been scheduled. ${contactInfo}`;
        const subjectConstructor = () => `Appointment reminder: ${location.name} on ${formattedTime}`;
        return sendEmail(user, { subjectConstructor, emailBodyConstructor });
    },

    createAppointment(completeAppointmentData) {
        const createGoogleCalendarAppointment = ({ user, location, course, tutorData, comments, time }) => {
            const calendarId = location.calendarId;

            const startTime = time;
            const endTime = dateTime.addMinutes(startTime, APPOINTMENT_LENGTH);

            const summary = user.getAppointmentSummary({ course, tutorData });
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

        const saveAppointment = ({ user, googleCalendarAppointmentId, time, location, subject, course, tutorData }) => {
            const googleCalendarAppointmentDate = time;
            const googleCalendarId = location.calendarId;

            const appointment = mainStorage.db.models.scheduledAppointment.build({
                userId: user.id,
                subjectId: subject.id,
                courseId: course.id,
                locationId: location.id,
                tutorId: tutorData.tutor.id,
                googleCalendarAppointmentId,
                googleCalendarAppointmentDate,
                googleCalendarId,
            });
            return appointment.save();
        };

        const { subject, course, location, tutorData, time, comments, user } = completeAppointmentData;

        return createGoogleCalendarAppointment({ user, location, course, tutorData, comments, time })
            .then((result) => saveAppointment({
                user,
                googleCalendarAppointmentId: result.id,
                time,
                location,
                subject,
                course,
                tutorData,
            }));
    },
});
