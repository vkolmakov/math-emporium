import db from 'sequelize-connect';
import moment from 'moment';

import { createExtractDataValuesFunction, isObject,
         hasOneOf, pickOneFrom, TIMESTAMP_FORMAT, TIMEZONE,
         APPOINTMENT_LENGTH } from '../aux';
import { notFound, actionFailed, getValidationErrorText, isCustomError } from '../services/errorMessages';
import { successMessage } from '../services/messages';
import { availableTutors } from '../services/openSpots/openSpots.service';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;
const Subject = db.models.subject;

const allowedToRead = ['id', 'firstName', 'lastName', 'courseId', 'locationId', 'subjectId',
                       'googleCalendarAppointmentDate', 'phoneNumber'];
const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const updateProfile = () => async (req, res, next) => {
    const allowedToWrite = ['firstName', 'lastName', 'phoneNumber'];
    let user;

    try {
        const userId = req.user.dataValues.id;
        user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }


        if (hasOneOf(req.body, 'location')) {
            let location;
            if (isObject(req.body.location) && hasOneOf(req.body.location, 'id', 'name')) {
                location = await Location.findIfExists(req.body.location);

                if (!location) {
                    res.status(404).json(notFound('location'));
                }

                if (!location.isActive) {
                    res.status(422).json(actionFailed('add', 'location', 'location is inactive'));
                }

                await user.setLocation(location);
            } else {
                await user.setLocation(null);
            }
        }

        if (hasOneOf(req.body, 'subject')) {
            let subject;
            if (isObject(req.body.subject) && hasOneOf(req.body.subject, 'id', 'name')) {
                subject = await Subject.findOne({
                    where: { id: req.body.subject.id },
                });

                if (!subject) {
                    res.status(400).json(notFound('subject'));
                }
                await user.setSubject(subject);
            } else {
                await user.setSubject(null);
            }
        }

        if (hasOneOf(req.body, 'course')) {
            let course;
            if (isObject(req.body.course) && hasOneOf(req.body.course, 'id', 'name')) {
                course = await Course.findOne({
                    where: { id: req.body.course.id },
                });

                if (!course) {
                    res.status(400).json(notFound('course'));
                }
                await user.setCourse(course);
            } else {
                await user.setCourse(null);
            }
        }
    } catch (err) {
        next(err);
    }

    try {
        const result = await user.update(req.body, {
            fields: allowedToWrite,
        });

        res.status(200).json(extractDataValues(result));
    } catch (err) {
        const validationErrorMessage = getValidationErrorText(err);
        next(actionFailed('update', 'profile', validationErrorMessage));
    }
};

export const getProfile = () => async (req, res, next) => {
    try {
        const userId = req.user.dataValues.id;
        const user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        res.status(200).json(extractDataValues(user));
    } catch (err) {
        next(err);
    }
};

export const scheduleAppointment = (logEvent) => async (req, res, next) => {
    /* required request params:

     location: { id },
     course: { id },
     time: aux.TIMESTAMP_FORMAT: String,

     optional:

     tutor: { id },
     comments: String,

     */
    const user = req.user;
    moment.tz.setDefault(TIMEZONE);

    const throwVisibleError = (message) => {
        throw actionFailed('schedule', 'appointment', message);
    };

    try {
        if (!user.firstName || !user.lastName || !user.phoneNumber) {
            throwVisibleError('first name, last name and phone number are required to schedule an appointment.');
        }

        const {
            time,
            course,
            subject,
            location,
            tutor: requestedTutor,
            comments,
        } = req.body;

        if (!time || !course || !location) {
            throwVisibleError('time, course and location are required');
        }

        // Check if user already has an upcoming appointment
        const nextAppointment = moment(user.dataValues.googleCalendarAppointmentDate);
        const now = moment();
        if (nextAppointment.isAfter(now)) {
            throwVisibleError(`can't have more than one appointment at the same time. You can go to your profile, cancel your previously scheduled appointment and try again.`);
        }

        const locationRes = await Location.findOne({
            where: { id: location.id },
        });

        if (!locationRes.isActive) {
            throwVisibleError('selected location is not active');
        }

        const courseRes = await Course.findOne({
            where: { id: course.id },
        });

        const subjectRes = await Subject.findOne({
            where: { id: subject.id },
        });

        const tutors = await availableTutors(
            location,
            course,
            moment(time, TIMESTAMP_FORMAT),
            moment(time, TIMESTAMP_FORMAT).add(APPOINTMENT_LENGTH, 'minutes'),
        );

        let tutorData;
        if (requestedTutor) {
            tutorData = {
                tutor: tutors.find(t => t.id === requestedTutor.id),
                wasExplicitlyRequested: true,
            };
        } else {
            tutorData = {
                tutor: pickOneFrom(tutors),
                wasExplicitlyRequested: false,
            };
        }

        const result = await user.createGoogleCalendarAppointment({
            time: moment(time, TIMESTAMP_FORMAT),
            course: courseRes.dataValues,
            location: locationRes.dataValues,
            tutorData,
            comments,
        });

        await user.update({
            googleCalendarAppointmentId: result.id,
            googleCalendarAppointmentDate: result.start.dateTime,
            googleCalendarId: result.organizer.email,
        }, {
            fields: ['googleCalendarAppointmentId', 'googleCalendarAppointmentDate', 'googleCalendarId'],
        });

        await user.sendAppointmentReminder({
            time: moment(result.start.dateTime),
            location,
            tutor: tutorData.tutor,
            course,
        });

        await logEvent(req);

        if (!user.hasDefaultAppointmentPreferences()) {
            await user.setDefaultAppointmentPreferences(locationRes, subjectRes, courseRes);
        }

        res.status(200).json(extractDataValues(user));
    } catch (err) {
        if (isCustomError(err)) {
            return res.status(err.status).json(err);
        }
        return next(err);
    }
};

export const deleteAppointment = (logEvent) => async (req, res, next) => {
    const user = req.user;

    const hasNextAppointment = !!user.dataValues.googleCalendarAppointmentId
          && !!user.dataValues.googleCalendarAppointmentDate
          && !!user.dataValues.googleCalendarId;

    if (!hasNextAppointment) {
        next(actionFailed('remove', 'appointment', 'Appointment was already removed'));
    } else {
        try {
            // Go to Google Calendar and remove the actual event
            await user.deleteGoogleCalendarAppointment();
        } catch (err) {
            // check if the appointment was deleted by hand
            const isAlreadyDeleted = err.message.toLowerCase().indexOf('delete') > -1;
            if (!isAlreadyDeleted) {
                // something went horribly wrong
                next(err);
            }
        }

        try {
            const appointmentTime = moment(user.dataValues.googleCalendarAppointmentDate);
            await user.update({
                googleCalendarAppointmentId: null,
                googleCalendarAppointmentDate: null,
                googleCalendarId: null,
            }, {
                fields: [
                    'googleCalendarAppointmentId',
                    'googleCalendarAppointmentDate',
                    'googleCalendarId',
                ],
            });

            await user.sendAppoinmentRemovalConfirmation({ appointmentTime });
            await logEvent(req);
        } catch (err) {
            next(err);
        }

        res.status(200).json(successMessage());
    }
};
