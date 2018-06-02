import { dateTime, pickOneFrom, R, APPOINTMENT_LENGTH } from '../aux';
import { SETTINGS_KEYS } from '../services/settings/settings.service';

const RECOVERY_SUGGESTION = {
    RESCHEDULE: "RESCHEDULE",
};

const quantityItemDescription = (quantity, item) => {
    let result;
    if (quantity === 1) {
        result = `${quantity} ${item}`;
    } else {
        result = `${quantity} ${item}s`;
    }
    return result;
};

export default (mainStorage, calendarService, sendEmail, openSpotsService, getSettingsValue) => ({
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

        const settingsPromise = getSettingsValue(SETTINGS_KEYS.maximumAppointmentsPerUser)
              .then((maximumAppointmentsPerUser) => ({
                  [SETTINGS_KEYS.maximumAppointmentsPerUser]: maximumAppointmentsPerUser
              }));

        return Promise.all([
            locationPromise,
            coursePromise,
            tutorDataPromise,
            settingsPromise
        ]).then(([location, course, tutorData, settings]) => {
            const completeAppointmentData = {
                comments: appointmentData.comments,
                time: appointmentDateTime,
                location,
                subject: appointmentData.subject, // actually a subjectRef
                course,
                tutorData,
                user,
                settings,
            };

            return completeAppointmentData;
        });
    },

    getActiveAppointmentsForUser(user, now) {
        return mainStorage.db.models.scheduledAppointment.findAll({
            where: { userId: user.id, googleCalendarAppointmentDate: { $gt: now } },
            order: [['googleCalendarAppointmentDate', 'ASC']]
        });
    },

    canCreateAppointment(completeAppointmentData, activeAppointmentsForUser, now) {
        const withRecoverySuggestion = (suggestion, message) => {
            const suggestionMessage = {
                [RECOVERY_SUGGESTION.RESCHEDULE]: "You can cancel one of your existing appointments from the profile page to reschedule",
            };

            return `${message}. ${suggestionMessage[suggestion]}`;
        };

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
                error: `following properties were missing: ${missingProps.join(', ')}`,
            };
        };

        const hasCompleteUserProfile = ({ user }) => ({
            isValid: user.firstName && user.lastName && user.phoneNumber,
            error: 'please update your profile: phone number, first and last names are required',
        });

        const isLocationActive = ({ location }) => ({
            isValid: location.isActive,
            error: 'requested location is not active',
        });

        const courseBelongsToLocation = ({ course, location }) => ({
            isValid: course.locationId === location.id,
            error: 'requested location and course are not matching',
        });

        const courseBelongsToSubject = ({ course, subject }) => ({
            isValid: course.subjectId === subject.id,
            error: 'requested course and subject are not matching',
        });

        const isAfterNow = ({ time }) => ({
            isValid: dateTime.isAfter(time, now),
            error: 'requested appointment time is no longer available',
        });

        const doesNotExceedUserMaximum = ({ settings }) => {
            const maximumAppointmentsPerUser = settings[SETTINGS_KEYS.maximumAppointmentsPerUser];

            return {
                isValid: activeAppointmentsForUser.length < maximumAppointmentsPerUser,
                error: withRecoverySuggestion(
                    RECOVERY_SUGGESTION.RESCHEDULE,
                    `cannot have more than ${quantityItemDescription(maximumAppointmentsPerUser, 'appointment')} the same time`  // eslint-disable-line max-len
                ),
            };
        };

        const doesNotExceedLocationMaximum = ({ location }) => {
            const { maximumAppointmentsPerLocation } = location;
            const activeAppointmentsForUserAtLocation = activeAppointmentsForUser.filter(
                (appointment) => appointment.locationId === location.id);

            return {
                isValid: activeAppointmentsForUserAtLocation.length < maximumAppointmentsPerLocation,
                error: withRecoverySuggestion(
                    RECOVERY_SUGGESTION.RESCHEDULE,
                    `cannot have more than ${quantityItemDescription(maximumAppointmentsPerLocation, 'appointment')} at this location at the same time`  // eslint-disable-line max-len
                ),
            };
        };

        const doesNotExceedSubjectMaximum = ({ location, subject }) => {
            const { maximumAppointmentsPerSubject } = location;
            const activeAppointmentsForUserWithSubject = activeAppointmentsForUser.filter(
                (appointment) => appointment.subjectId === subject.id);

            return {
                isValid: activeAppointmentsForUserWithSubject.length < maximumAppointmentsPerSubject,
                error: withRecoverySuggestion(
                    RECOVERY_SUGGESTION.RESCHEDULE,
                    `cannot have more than ${quantityItemDescription(maximumAppointmentsPerSubject, 'appointment')} for this subject at the same time`, // eslint-disable-line max-len
                ),
            };
        };

        const doesNotExceedCourseMaximum = ({ location, course }) => {
            const { maximumAppointmentsPerCourse } = location;
            const activeAppointmentsForUserWithCourse = activeAppointmentsForUser.filter(
                (appointment) => appointment.courseId === course.id);

            return {
                isValid: activeAppointmentsForUserWithCourse.length < maximumAppointmentsPerCourse,
                error: withRecoverySuggestion(
                    RECOVERY_SUGGESTION.RESCHEDULE,
                    `cannot have more than ${quantityItemDescription(maximumAppointmentsPerCourse, 'appointment')} for this course at the same time`, // eslint-disable-line max-len
                ),
            };
        };

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
                reason: result.accumulatedErrors.length > 0
                    ? `${result.accumulatedErrors[0]}.`
                    : ''
            };
        };

        const validators = [
            hasAllRequestedAppointmentData,
            hasCompleteUserProfile,
            isLocationActive,
            courseBelongsToSubject,
            courseBelongsToLocation,
            isAfterNow,
            doesNotExceedUserMaximum,
            doesNotExceedLocationMaximum,
            doesNotExceedSubjectMaximum,
            doesNotExceedCourseMaximum,
        ];

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

    createAppointment(completeAppointmentData, now) {
        const createGoogleCalendarAppointment = ({ user, location, course, tutorData, comments, time }) => {
            const calendarId = location.calendarId;

            const startTime = time;
            const endTime = dateTime.addMinutes(startTime, APPOINTMENT_LENGTH);

            const getAppointmentSummary = () => {
                const EXPLICITLY_REQUESTED_TUTOR_SYMBOL = ' ## ';

                const tutorName = tutorData.tutor.name;
                const wasTutorExplicitlyRequested = tutorData.wasExplicitlyRequested;

                return `${tutorName}${wasTutorExplicitlyRequested ? EXPLICITLY_REQUESTED_TUTOR_SYMBOL : ' '}(${user.firstName}) ${course.code}`;
            };

            const getAppointmentDescription = () => {
                return [`Student: ${user.firstName} ${user.lastName}`,
                        `Email: ${user.email}`,
                        `Phone number: ${user.phoneNumber}`,
                        '',
                        `Course: ${course.code}: ${course.name}`,
                        `Created on: ${dateTime.formatVisible(now)}`,
                        'Created online',
                        comments ? `Comments: ${comments}` : '',
                       ].join('\n');
            };

            const summary = getAppointmentSummary();
            const description = getAppointmentDescription();
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
