import db from 'sequelize-connect';
import { createExtractDataValuesFunction, isObject, hasOneOf } from '../aux';

const tutorController = {};

const Location = db.models.location;
const Tutor = db.models.tutor;
const Course = db.models.course;

const allowedToRead = ['id', 'name', 'location', 'courses']; // TODO: Add courses and schedules
const allowedToWrite = ['name']; // TODO: Add courses and schedules
const relatedModels = [Location, { model: Course, as: 'courses' }];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);


tutorController.handleGet = async (req, res, next) => {
    try {
        const tutorsRes = await Tutor.findAll({
            include: relatedModels,
        });
        const tutors = tutorsRes.map((tutor) => extractDataValues(tutor));

        res.status(200).json(tutors);
    } catch (err) {
        next(err);
    }
};

tutorController.handleGetId = async (req, res, next) => {
    try {
        const tutor = await Tutor.findOne({
            where: { id: req.params.id },
            include: relatedModels,
        });
        if (tutor) {
            res.status(200).json(extractDataValues(tutor));
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        next(err);
    }
};

tutorController.handlePost = async (req, res, next) => {
    try {
        if (!isObject(req.body.location)) {
            throw Error('"location" object (with "name" or "id" field) is required');
        }

        const location = await Location.findIfExists(req.body.location);

        if (!location) {
            throw Error('Selected location does not exist');
        }

        const createdTutor = Tutor.build(req.body, {
            fields: allowedToWrite,
        });
        await createdTutor.setLocation(location, { save: false });
        await createdTutor.save();

        res.status(201).json(extractDataValues(createdTutor));
    } catch (err) {
        next(err);
    }
};

tutorController.handleDelete = async (req, res, next) => {
    try {
        const removedTutor = await Tutor.destroy({
            where: { id: req.params.id },
        });

        if (removedTutor) {
            res.status(200).json({});
        } else {
            res.status(400).json({});
        }
    } catch (err) {
        next(err);
    }
};

tutorController.handleUpdate = async (req, res, next) => {
    try {
        const updatedTutor = await Tutor.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (!updatedTutor) {
            throw Error('Tutor not found');
        }

        // possibly updating location
        let location;
        if (hasOneOf(req.body, 'location')) {
            if (isObject(req.body.location) && hasOneOf(req.body.location, 'id', 'name')) {
                location = await Location.findIfExists(req.body.location);
                if (!location) {
                    throw Error('Location does not exists');
                }
            } else {
                throw Error('"location" object (with "name" or "id" field) is required to update the location');
            }
            await updatedTutor.setLocation(location);
        }

        // possibly updating courses
        if (hasOneOf(req.body, 'courses')) {
            if (isObject(req.body.courses) && (hasOneOf(req.body.courses[0], 'id') || req.body.courses.length === 0)) {
                // check if first element of the array is a valid course
                await updatedTutor.setCourses(req.body.courses.map((course) => course.id));
            } else {
                throw Error('"courses" must be an array with course objects that have "id" properties');
            }
        }
        // updating general info
        const result = await updatedTutor.update(req.body, {
            include: relatedModels,
            fields: allowedToWrite,
        });
        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
};

module.exports = tutorController;
