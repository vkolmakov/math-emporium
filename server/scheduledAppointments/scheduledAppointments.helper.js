import { dateTime, pickOneFrom, R, APPOINTMENT_LENGTH } from '../aux';

const quantityItemDescription = (quantity, item) => {
    let result;
    if (quantity === 1) {
        result = `${quantity} ${item}`;
    } else {
        result = `${quantity} ${item}s`;
    }
    return result;
};

export default (mainStorage, calendarService, sendEmail, openSpotsService) => ({
    gatherCompleteAppointmentData(user, appointmentData, appointmentDateTime) {
        const locationPromise = mainStorage.db.models.location.findOne({ where: { id: appointmentData.location.id } });

        const coursePromise = mainStorage.db.models.course.findOne({
            where: {
                id: appointmentData.course.id,
                locationId: appointmentData.location.id,
            },
        });

        const tutorDataPromise = openSpotsService.availableTutors(
            appointmentData.location,
            appointmentData.course,
            appointmentDateTime,
            dateTime.addMinutes(appointmentDateTime, APPOINTMENT_LENGTH)
        ).then((availableTutors) => {
            const wasExplicitlyRequested = !!appointmentData.tutor;
            const tutorRef = wasExplicitlyRequested
                  ? appointmentData.tutor
                  : pickOneFrom(availableTutors);
            const isSelectedTutorAvailable = !!tutorRef && availableTutors.map(R.prop('id')).includes(tutorRef.id);

            let result;
            if (isSelectedTutorAvailable) {
                result = mainStorage.db.models.tutor.findOne({ where: { id: tutorRef.id } })
                    .then((tutor) => ({ wasExplicitlyRequested, tutor }));
            } else {
                const rejectionReason = wasExplicitlyRequested
                      ? 'Requested tutor is no longer available'
                      : 'There are no more tutors available for this time slot';

                result = Promise.reject(rejectionReason);
            }

            return result;
        });

        return Promise.all([
            locationPromise,
            coursePromise,
            tutorDataPromise,
        ]).then(([location, course, tutorData]) => {
            const completeAppointmentData = {
                comments: appointmentData.comments,
                time: appointmentDateTime,
                location,
                subject: appointmentData.subject, // actually a subjectRef
                course,
                tutorData,
                user,
            };

            return completeAppointmentData;
        });
    },

    getActiveAppointmentsForUserAtLocation(user, appointmentData, now) {
        return mainStorage.db.models.scheduledAppointment.findAll({
            where: { userId: user.id, locationId: appointmentData.location.id, googleCalendarAppointmentDate: { $gt: now } },
        });
    },

    canCreateAppointment(completeAppointmentData, activeAppointmentsForUserAtLocation, now) {
        const hasAllRequestedAppointmentData = (appointmentData) => {
            const requiredAppointmentDataTypes = {
                time: Date,
                location: Object,
                subject: Object,
                course: Object,
                tutorData: Object,
                user: Object,
            };

            const missingProps = Object.keys(requiredAppointmentDataTypes).reduce((acc, requiredProp) => {
                const isPresentAndCorrectType = !!appointmentData[requiredProp]
                      && appointmentData[requiredProp] instanceof requiredAppointmentDataTypes[requiredProp];

                return isPresentAndCorrectType
                    ? acc
                    : acc.concat(requiredProp);
            }, []);

            return {
                isValid: missingProps.length === 0,
                error: `Following properties were missing: ${missingProps.join(', ')}`,
            };
        };

        const isLocationActive = ({ location }) => ({
            isValid: location.isActive,
            error: 'Requested location is not active',
        });

        const courseBelongsToLocation = ({ course, location }) => ({
            isValid: course.locationId === location.id,
            error: 'Requested location and course are not matching',
        });

        const courseBelongsToSubject = ({ course, subject }) => ({
            isValid: course.subjectId === subject.id,
            error: 'Requested course and subject are not matching',
        });

        const isAfterNow = ({ time }) => ({
            isValid: dateTime.isAfter(time, now),
            error: 'Requested appointment time is no longer available',
        });

        const doesNotExceedLocationMaximum = ({ location }) => {
            const { maximumAppointmentsPerLocation } = location;
            return {
                isValid: activeAppointmentsForUserAtLocation.length < maximumAppointmentsPerLocation,
                error: `Cannot have more than ${quantityItemDescription(maximumAppointmentsPerLocation, 'appointment')} at this location at the same time`, // eslint-disable-line max-len
            };
        };

        const doesNotExceedSubjectMaximum = ({ location, subject }) => {
            const { maximumAppointmentsPerSubject } = location;
            const activeAppointmentsForUserAtLocationWithSubject = activeAppointmentsForUserAtLocation.filter(
                (appointment) => appointment.subjectId === subject.id);

            return {
                isValid: activeAppointmentsForUserAtLocationWithSubject.length < maximumAppointmentsPerSubject,
                error: `Cannot have more than ${quantityItemDescription(maximumAppointmentsPerSubject, 'appointment')} at for this subject at this location at the same time`, // eslint-disable-line max-len
            };
        };

        const doesNotExceedCourseMaximum = ({ location, course }) => {
            const { maximumAppointmentsPerCourse } = location;
            const activeAppointmentsForUserAtLocationWithCourse = activeAppointmentsForUserAtLocation.filter(
                (appointment) => appointment.courseId === course.id);

            return {
                isValid: activeAppointmentsForUserAtLocationWithCourse.length < maximumAppointmentsPerCourse,
                error: `Cannot have more than ${quantityItemDescription(maximumAppointmentsPerCourse, 'appointment')} at for this course at this location at the same time`, // eslint-disable-line max-len
            };
        };

        const validators = [
            hasAllRequestedAppointmentData,
            isLocationActive,
            courseBelongsToSubject,
            courseBelongsToLocation,
            isAfterNow,
            doesNotExceedLocationMaximum,
            doesNotExceedSubjectMaximum,
            doesNotExceedCourseMaximum,
        ];

        const applyValidators = (validators) => {
            const result = validators.reduce((result, validator) => {
                const { isValid, error } = validator(completeAppointmentData);

                return {
                    isValid: result.isValid && isValid,
                    accumulatedErrors: !isValid
                        ? result.accumulatedErrors.concat([error])
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

        const emailBodyConstructor = () => `Your appointment for ${course.code} with ${tutorData.tutor.name} on ${formattedTime} in the ${location.name} has been scheduled. ${contactInfo}`; // eslint-disable-line max-len
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

    sendAppointmentDeletionConfirmation(user, appointment, location) {
        const appointmentTimeString = appointment.googleCalendarAppointmentDate;
        const formattedTime = dateTime.formatVisible(dateTime.parse(appointmentTimeString));

        const contactInfo = !!location.phone || !!location.email
              ? `Please contact us at ${location.phone || location.email} if you have any questions for us.`
              : '';

        const emailBodyConstructor = () =>
              `We've successfully cancelled your appointment on ${formattedTime} at ${location.name}. ${contactInfo}`;
        const subjectConstructor = () => `Your appointment at ${location.name} was successfully cancelled`;

        return sendEmail(user, { subjectConstructor, emailBodyConstructor });
    },

    getSingleActiveAppointmentWithLocation(user, deletionRecord, now) {
        const { id } = deletionRecord;

        return mainStorage.db.models.scheduledAppointment.findOne({
            where: { userId: user.id, id: id, googleCalendarAppointmentDate: { $gt: now } },
        }).then((appointment) => {
            let result;

            if (!!appointment) {
                result = mainStorage.db.models.location.findOne({ where: { id: appointment.locationId } })
                    .then((location) => ({ appointment, location }));
            } else {
                result = Promise.reject('Requested appointment was not found');
            }

            return result;
        });
    },

    deleteAppointment(appointment) {
        const wasAppointmentAlreadyDeletedOnCalendar = (calendarError) => {
            return !!calendarError
                && !!calendarError.message
                && calendarError.message.toLowerCase().includes('deleted');
        };

        return calendarService.deleteCalendarEvent({
            eventId: appointment.googleCalendarAppointmentId,
            calendarId: appointment.googleCalendarId,
        }).then(
            () => Promise.resolve(true),
            // explicitly handle a case when appointment could've
            // been manually removed from the calendar
            (error) => Promise.resolve(wasAppointmentAlreadyDeletedOnCalendar(error)),
        ).then((shouldProceed) => {
            return shouldProceed
                ? Promise.resolve()
                : Promise.reject();
        }).then(() => {
            return mainStorage.db.models.scheduledAppointment.destroy({
                where: { id: appointment.id },
            });
        });
    },
});
