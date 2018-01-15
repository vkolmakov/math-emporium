import db from 'sequelize-connect';
import moment from 'moment';

import { createExtractDataValuesFunction, isObject,
         hasOneOf, pickOneFrom, TIMESTAMP_FORMAT, TIMEZONE,
         APPOINTMENT_LENGTH } from '../aux';
import { notFound, actionFailed } from '../services/errorMessages';
import { successMessage } from '../services/messages';
import { availableTutors } from '../services/openSpots/openSpots.service';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;
const Subject = db.models.subject;

const allowedToRead = ['id', 'firstName', 'lastName', 'courseId', 'locationId', 'subjectId',
                       'next', 'googleCalendarAppointmentDate'];
const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const updateProfile = async (req, res, next) => {
    const allowedToWrite = ['firstName', 'lastName'];

    try {
        const userId = req.user.dataValues.id;
        const user = await User.findOne({
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

        const result = await user.update(req.body, {
            fields: allowedToWrite,
        });

        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
};

export const getProfile = async (req, res, next) => {
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

export const scheduleAppointment = async (req, res, next) => {
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

    try {
        if (!user.firstName || !user.lastName) {
            throw new Error('VISIBLE::Error: first and last names are required.');
        }

        const {
            time,
            course,
            location,
            tutor: requestedTutor,
            comments,
        } = req.body;

        if (!time || !course || !location) {
            throw new Error('VISIBLE::Error: time, course and location are required');
        }

        // Check if user already has an upcomming appointment
        const nextAppointment = moment(user.dataValues.googleCalendarAppointmentDate);
        const now = moment();
        if (nextAppointment.isAfter(now)) {
            throw new Error(`VISIBLE::Error: can't have more than one appointment at the same time. You can go to your profile, cancel your previously scheduled appointment and try again.`);
        }

        const locationRes = await Location.findOne({
            where: { id: location.id },
        });

        if (!locationRes.isActive) {
            throw new Error('VISIBLE::Error: selected location is not active');
        }

        const courseRes = await Course.findOne({
            where: { id: course.id },
        });

        const tutors = await availableTutors(
            location,
            course,
            moment(time, TIMESTAMP_FORMAT),
            moment(time, TIMESTAMP_FORMAT).add(APPOINTMENT_LENGTH, 'minutes'),
        );

        let tutor;
        if (requestedTutor) {
            tutor = tutors.find(t => t.id === requestedTutor.id);
        } else {
            tutor = pickOneFrom(tutors);
        }

        const result = await user.createGoogleCalendarAppointment({
            time: moment(time, TIMESTAMP_FORMAT),
            course: courseRes.dataValues,
            location: locationRes.dataValues,
            tutor,
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
            tutor,
            course,
        });

        res.status(200).json(extractDataValues(user));
    } catch (err) {
        if (err.message.startsWith('VISIBLE::')) {
            // yes, I feel super hacky doing that
            res.status(422).json({ error: err.message.split('::')[1] });
        }
        next(err);
    }
};

export const deleteAppointment = async (req, res, next) => {
    const user = req.user;

    try {
        // Go to Google Calendar and remove the actual event
        await user.deleteGoogleCalendarAppointment();
    } catch (err) {
        // check if the appointment was deleted by hand
        const isAlreadyDeleted = err.message.toLowerCase().indexOf('delete') > -1;
        if (!isAlreadyDeleted) {
            next(err);
        }
    }

    // Change calendarAppointmentId and nextAppointment in the user profile to null
    try {
        const appointmentTime = moment(user.dataValues.googleCalendarAppointmentDate);
        await user.update({
            googleCalendarAppointmentId: null,
            googleCalendarAppointmentDate: null,
            googleCalendarId: null,
        }, {
            fields: ['googleCalendarAppointmentId', 'googleCalendarAppointmentDate', 'googleCalendarId'],
        });

        await user.sendAppoinmentRemovalConfirmation({ appointmentTime });
    } catch (err) {
        next(err);
    }

    res.status(200).json(successMessage());
};
