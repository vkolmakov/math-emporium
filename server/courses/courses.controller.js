import db from "sequelize-connect";
import {
    createExtractDataValuesFunction,
    isObject,
    hasOneOf,
    transformRequestToQuery,
} from "../aux";
import { notFound, isRequired, actionFailed } from "../services/errorMessages";
import { pluckPublicFields, isActive } from "./courses.model";

const Location = db.models.location;
const Course = db.models.course;
const Subject = db.models.subject;

const allowedToRead = ["id", "name", "code", "color", "location", "subject"];
const allowedToWrite = ["name", "code", "color"];
const relatedModels = [Location, Subject];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const getCourses = (body) =>
    new Promise(async (resolve) => {
        const coursesRes = await Course.findAll({
            where: transformRequestToQuery(body),
            include: relatedModels,
        });
        resolve(coursesRes.map((courseRes) => extractDataValues(courseRes)));
    });

export const getCourse = (id) =>
    new Promise(async (resolve, reject) => {
        const course = await Course.findOne({
            include: relatedModels,
            where: { id },
        });

        if (course) {
            resolve(extractDataValues(course));
        } else {
            reject(notFound("Course"));
        }
    });

export const createCourse = (body) =>
    new Promise(async (resolve, reject) => {
        if (
            !isObject(body.location) ||
            !hasOneOf(body.location, "name", "id")
        ) {
            reject(isRequired("Location"));
        }

        if (!isObject(body.subject) || !hasOneOf(body.location, "name", "id")) {
            reject(isRequired("Subject"));
        }

        const location = await Location.findIfExists(body.location);

        if (!location) {
            reject(notFound("Location"));
        }

        const subject = await Subject.findOne({
            where: {
                $or: [{ id: body.subject.id }, { name: body.subject.name }],
            },
        });

        if (!subject) {
            reject(notFound("Subject"));
        }

        const createdCourse = Course.build(body, {
            fields: allowedToWrite,
        });

        await createdCourse.setLocation(location, { save: false });
        await createdCourse.setSubject(subject, { save: false });

        try {
            await createdCourse.save();
            resolve(extractDataValues(createdCourse));
        } catch (err) {
            // caught a validation error
            reject(actionFailed("create", "course", err.message));
        }
    });

export const deleteCourse = (id) =>
    new Promise(async (resolve, reject) => {
        const removedCourse = await Course.destroy({
            where: { id },
        });

        if (removedCourse) {
            resolve({ id });
        } else {
            reject(actionFailed("remove", "course"));
        }
    });

export const updateCourse = (id, body) =>
    new Promise(async (resolve, reject) => {
        const updatedCourse = await Course.findOne({
            include: relatedModels,
            where: { id },
        });

        if (!updatedCourse) {
            reject(notFound("Course"));
        }

        let location;
        if (hasOneOf(body, "location")) {
            if (
                isObject(body.location) &&
                hasOneOf(body.location, "id", "name")
            ) {
                location = await Location.findIfExists(body.location);

                if (!location) {
                    reject(notFound("location"));
                }
            } else {
                reject(notFound("location"));
            }
            await updatedCourse.setLocation(location);
        }

        let subject;
        if (hasOneOf(body, "subject")) {
            if (
                isObject(body.subject) &&
                hasOneOf(body.subject, "id", "name")
            ) {
                subject = await Subject.findOne({
                    where: {
                        $or: [
                            { id: body.subject.id },
                            { name: body.subject.name },
                        ],
                    },
                });

                if (!subject) {
                    reject(notFound("subject"));
                }
            } else {
                reject(notFound("subject"));
            }
            await updatedCourse.setSubject(subject);
        }

        let result;
        try {
            result = await updatedCourse.update(body, {
                include: relatedModels,
                fields: allowedToWrite,
            });
            resolve(extractDataValues(result));
        } catch (err) {
            // caught a validation error
            reject(actionFailed("update", "course", err.message));
        }
    });

export const handleGet = async (req, res, next) => {
    try {
        const courses = await getCourses(req.body);
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
};

export const handlePublicGet = async (req, res, next) => {
    try {
        const courses = await getCourses(req.body);
        res.status(200).json(courses.filter(isActive).map(pluckPublicFields));
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const course = await getCourse(req.params.id);
        res.status(200).json(course);
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        const createdCourse = await createCourse(req.body);
        res.status(201).json(extractDataValues(createdCourse));
    } catch (err) {
        next(err);
    }
};

export const handleDelete = async (req, res, next) => {
    try {
        const deletedCourse = await deleteCourse(req.params.id);
        res.status(200).json(deletedCourse);
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedCourse = await updateCourse(req.params.id, req.body);
        res.status(200).json(updatedCourse);
    } catch (err) {
        next(err);
    }
};
