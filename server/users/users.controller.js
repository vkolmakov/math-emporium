import db from 'sequelize-connect';
import moment from 'moment';

import { createExtractDataValuesFunction, isObject, hasOneOf, TIMESTAMP_FORMAT } from '../aux';
import { notFound, isRequired, actionFailed, errorMessage } from '../services/errorMessages';
import { successMessage } from '../services/messages';
import { findAvailableTutor } from '../services/openSpots/openSpots.service';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;
const Tutor = db.models.tutor;

const allowedToRead = ['id', 'firstName', 'lastName', 'courseId', 'locationId', 'next', 'googleCalendarAppointmentDate'];
const extractDataValues = createExtractDataValuesFunction(allowedToRead);
// Add an endpoint to post firstName, lastName and location + course for a user
// store it under api/private/user
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
                    res.status(400).json(notFound('location'));
                }
                await user.setLocation(location);
            } else {
                await user.setLocation(null);
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

     */
    const user = req.user;

    try {
        if (!user.firstName || !user.lastName) {
            throw new Error('First and last names are required.');
        }

        const {
            time,
            course,
            location,
        } = req.body;

        if (!time || !course || !location) {
            throw new Error('Time, course and location are required');
        }

        // Check if user already has an upcomming appointment
        const nextAppointment = moment(user.dataValues.googleCalendarAppointmentDate);
        const now = moment();
        if (nextAppointment.isAfter(now)) {
            throw new Error('Must not have more than one appointment at the same time');
        }

        const locationRes = await Location.findOne({
            where: { id: location.id },
        });

        const courseRes = await Course.findOne({
            where: { id: course.id },
        });

        const tutor = await findAvailableTutor({
            time: moment(time, TIMESTAMP_FORMAT),
            course,
            location });

        const result = await user.createGoogleCalendarAppointment({
            time: moment(time, TIMESTAMP_FORMAT),
            course: courseRes.dataValues,
            location: locationRes.dataValues,
            tutor,
        });

        await user.update({
            googleCalendarAppointmentId: result.id,
            googleCalendarAppointmentDate: result.start.dateTime,
            googleCalendarId: result.organizer.email,
        }, {
            fields: ['googleCalendarAppointmentId', 'googleCalendarAppointmentDate', 'googleCalendarId'],
        });

        res.status(200).json(extractDataValues(user));
    } catch (err) {
        next(err);
    }
};

export const deleteAppointment = async (req, res, next) => {
    const user = req.user;

    // Go to Google Calendar and remove the actual event
    await user.deleteGoogleCalendarAppointment();

    // Change calendarAppointmentId and nextAppointment in the user profile to null
    await user.update({
        googleCalendarAppointmentId: null,
        googleCalendarAppointmentDate: null,
        googleCalendarId: null,
    }, {
        fields: ['googleCalendarAppointmentId', 'googleCalendarAppointmentDate', 'googleCalendarId'],
    });

    res.status(200).json(successMessage());
};
