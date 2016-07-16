import db from 'sequelize-connect';
import { createExtractDataValuesFunction, isObject, hasOneOf, transformRequestToQuery } from '../aux';
import { notFound, isRequired, actionFailed, errorMessage } from '../services/errorMessages';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;

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
