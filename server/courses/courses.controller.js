import db from 'sequelize-connect';
import { createExtractDataValuesFunction, isObject, hasOneOf, transformRequestToQuery } from '../aux';

const Location = db.models.location;
const Course = db.models.course;

const allowedToRead = ['id', 'name', 'code', 'color', 'location'];
const allowedToWrite = ['name', 'code', 'color'];
const relatedModels = [Location];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const handleGet = async (req, res, next) => {
    try {
        const coursesRes = await Course.findAll({
            where: transformRequestToQuery(req.body),
            include: relatedModels,
        });
        const courses = coursesRes.map((courseRes) => extractDataValues(courseRes));

        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
};


export const handleGetId = async (req, res, next) => {
    try {
        // TODO: verify id's an integer
        const course = await Course.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });
        if (course) {
            res.status(200).json(extractDataValues(course));
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        if (!isObject(req.body.location) || !hasOneOf(req.body.location, 'name', 'id')) {
            throw Error('"location" object (with "name" or "id" field) is required');
        }

        const location = await Location.findIfExists(req.body.location);

        if (!location) {
            throw Error('Selected location does not exist');
        }

        const createdCourse = Course.build(req.body, {
            fields: allowedToWrite,
        });

        await createdCourse.setLocation(location, { save: false });
        await createdCourse.save();

        res.status(201).json(extractDataValues(createdCourse));
    } catch (err) {
        next(err);
    }
};

export const handleDelete = async (req, res, next) => {
    try {
        const removedCourse = await Course.destroy({
            where: { id: req.params.id },
        });
        if (removedCourse) {
            res.status(200).json({});
        } else {
            res.status(400).json({});
        }
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedCourse = await Course.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (!updatedCourse) {
            throw Error('Course not found');
        }

        let location;
        if (hasOneOf(req.body, 'location')) {
            if (isObject(req.body.location) && hasOneOf(req.body.location, 'id', 'name')) {
                location = await Location.findIfExists(req.body.location);

                if (!location) {
                    throw Error('Location does not exist');
                }
            } else {
                throw Error('"location" object (with "name" or "id" field) is required to update the location');
            }
            await updatedCourse.setLocation(location);
        }

        const result = await updatedCourse.update(req.body, {
            include: relatedModels,
            fields: allowedToWrite,
        });

        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
};
