import db from "sequelize-connect";
import {
    createExtractDataValuesFunction,
    isObject,
    hasOneOf,
    transformRequestToQuery,
} from "../aux";
import {
    notFound,
    isRequired,
    actionFailed,
    errorMessage,
} from "../services/errorMessages";

const Location = db.models.location;
const Tutor = db.models.tutor;
const Course = db.models.course;

const allowedToRead = ["id", "name", "location", "courses"];
const allowedToWrite = ["name"];
const relatedModels = [Location, { model: Course, as: "courses" }];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const handleGet = async (req, res, next) => {
    try {
        const tutorsRes = await Tutor.findAll({
            where: transformRequestToQuery(req.body),
            include: relatedModels,
        });
        const tutors = tutorsRes.map((tutor) => extractDataValues(tutor));

        res.status(200).json(tutors);
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const tutor = await Tutor.findOne({
            where: { id: req.params.id },
            include: relatedModels,
        });
        if (tutor) {
            res.status(200).json(extractDataValues(tutor));
        } else {
            res.status(404).json(notFound("tutor"));
        }
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        if (!isObject(req.body.location)) {
            res.status(422).json(isRequired("location"));
        }

        const location = await Location.findIfExists(req.body.location);

        if (!location) {
            res.status(422).json(notFound("location"));
        }

        const createdTutor = Tutor.build(req.body, {
            fields: allowedToWrite,
        });

        await createdTutor.setLocation(location, { save: false });
        await createdTutor.save();

        // possibly adding courses
        if (hasOneOf(req.body, "courses")) {
            if (
                isObject(req.body.courses) &&
                (hasOneOf(req.body.courses[0], "id") ||
                    req.body.courses.length === 0)
            ) {
                // check if first element of the array is a valid course
                await createdTutor.setCourses(
                    req.body.courses.map((course) => course.id)
                );
            } else {
                res.status(422).json(actionFailed("process", "courses"));
            }
        }

        res.status(201).json(extractDataValues(createdTutor));
    } catch (err) {
        if (err.message) {
            // this is a validation error!
            res.status(422).json(errorMessage(err.message));
        }
        next(err);
    }
};

export const handleDelete = async (req, res, next) => {
    try {
        const removedTutor = await Tutor.destroy({
            where: { id: req.params.id },
        });

        if (removedTutor) {
            res.status(200).json({ id: req.params.id });
        } else {
            res.status(404).json(actionFailed("remove", "tutor"));
        }
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedTutor = await Tutor.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (!updatedTutor) {
            res.status(404).json(notFound("tutor"));
        }

        // possibly updating location
        let location;
        if (hasOneOf(req.body, "location")) {
            if (
                isObject(req.body.location) &&
                hasOneOf(req.body.location, "id", "name")
            ) {
                location = await Location.findIfExists(req.body.location);
                if (!location) {
                    res.status(404).json(notFound("location"));
                }
            } else {
                res.status(422).json(notFound("location"));
            }
            await updatedTutor.setLocation(location);
        }

        // possibly updating courses
        if (hasOneOf(req.body, "courses")) {
            if (
                isObject(req.body.courses) &&
                (hasOneOf(req.body.courses[0], "id") ||
                    req.body.courses.length === 0)
            ) {
                // check if first element of the array is a valid course
                await updatedTutor.setCourses(
                    req.body.courses.map((course) => course.id)
                );
            } else {
                res.status(422).json(actionFailed("process", "courses"));
            }
        }
        // updating general info
        const result = await updatedTutor.update(req.body, {
            include: relatedModels,
            fields: allowedToWrite,
        });
        res.status(200).json(extractDataValues(result));
    } catch (err) {
        if (err.message) {
            // this is a validation error!
            res.status(422).json(errorMessage(err.message));
        }
        next(err);
    }
};
