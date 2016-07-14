import db from 'sequelize-connect';
import { createExtractDataValuesFunction, isObject, hasOneOf, transformRequestToQuery } from '../aux';
import { notFound, isRequired, actionFailed, errorMessage } from '../services/errorMessages';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;
// Add an endpoint to post firstName, lastName and location + course for a user
// store it under api/private/user
export const updateUserProfile = async (req, res, next) => {
    const allowedToWrite = ['firstName', 'lastName'];
    const allowedToRead = ['id', 'firstName', 'lastName', 'courseId', 'locationId'];
    const extractDataValues = createExtractDataValuesFunction(allowedToRead);

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
            } else {
                res.status(400).json(notFound('location'));
            }
            await user.setLocation(location);
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
            } else {
                res.status(400).json(notFound('course'));
            }
            await user.setCourse(course);
        }

        const result = await user.update(req.body, {
            fields: allowedToWrite,
        })

        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
}

// add an api endpoint to schedule an appointment, which will actually schedule one
// and write down goolgleCalendarAppointmentId and goolgleCalendarAppointmentDate
