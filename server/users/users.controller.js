import db from "sequelize-connect";
import moment from "moment";

import {
    createExtractDataValuesFunction,
    isObject,
    hasOneOf,
    pickOneFrom,
    TIMESTAMP_FORMAT,
    TIMEZONE,
    APPOINTMENT_LENGTH,
} from "../aux";
import {
    notFound,
    actionFailed,
    getValidationErrorText,
    isCustomError,
} from "../services/errorMessages";
import { successMessage } from "../services/messages";
import { availableTutors } from "../services/openSpots/openSpots.service";

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;
const Subject = db.models.subject;

const allowedToRead = [
    "id",
    "firstName",
    "lastName",
    "courseId",
    "locationId",
    "subjectId",
    "phoneNumber",
];
const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const updateProfile = () => async (req, res, next) => {
    const allowedToWrite = ["firstName", "lastName", "phoneNumber"];
    let user;

    try {
        const userId = req.user.dataValues.id;
        user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (hasOneOf(req.body, "location")) {
            let location;
            if (
                isObject(req.body.location) &&
                hasOneOf(req.body.location, "id", "name")
            ) {
                location = await Location.findIfExists(req.body.location);

                if (!location) {
                    res.status(404).json(notFound("location"));
                }

                if (!location.isActive) {
                    res.status(422).json(
                        actionFailed("add", "location", "location is inactive"),
                    );
                }

                await user.setLocation(location);
            } else {
                await user.setLocation(null);
            }
        }

        if (hasOneOf(req.body, "subject")) {
            let subject;
            if (
                isObject(req.body.subject) &&
                hasOneOf(req.body.subject, "id", "name")
            ) {
                subject = await Subject.findOne({
                    where: { id: req.body.subject.id },
                });

                if (!subject) {
                    res.status(400).json(notFound("subject"));
                }
                await user.setSubject(subject);
            } else {
                await user.setSubject(null);
            }
        }

        if (hasOneOf(req.body, "course")) {
            let course;
            if (
                isObject(req.body.course) &&
                hasOneOf(req.body.course, "id", "name")
            ) {
                course = await Course.findOne({
                    where: { id: req.body.course.id },
                });

                if (!course) {
                    res.status(400).json(notFound("course"));
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
        next(actionFailed("update", "profile", validationErrorMessage));
    }
};

export const getProfile = () => async (req, res, next) => {
    try {
        const userId = req.user.dataValues.id;
        const user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        res.status(200).json(extractDataValues(user));
    } catch (err) {
        next(err);
    }
};
