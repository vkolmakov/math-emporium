import db from 'sequelize-connect';
import aux from '../aux';

const courseController = {};
const allowedToRead = ['id', 'name', 'code', 'color', 'location'];
const allowedToWrite = ['name', 'code', 'color'];

const extractDataValues = aux.extractDataValues(allowedToRead);
const isObject = aux.isObject;
const hasOneOf = aux.hasOneOf;

courseController.handleGet = async (req, res, next) => {
    try {
        const coursesRes = await db.models.course.findAll({
            include: db.models.location,
        });
        const courses = coursesRes.map((course) => extractDataValues(course));

        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
};

courseController.handleGetId = async (req, res, next) => {
    try {
        // TODO: verify id's an integer
        const course = await db.models.course.findOne({
            include: db.models.location,
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

courseController.handlePost = async (req, res, next) => {
    try {
        if (!isObject(req.body.location) || !hasOneOf(req.body.location, 'name', 'id')) {
            throw Error('"location" object (with "name" or "id" field) is required');
        }

        const location = await db.models.location.findIfExists(req.body.location);

        if (!location) {
            throw Error('Selected location does not exist');
        }

        const createdCourse = db.models.course.build(req.body, {
            fields: allowedToWrite,
        });

        await createdCourse.setLocation(location);
        await createdCourse.save();

        res.status(201).json(extractDataValues(createdCourse));
    } catch (err) {
        next(err);
    }
};

courseController.handleDelete = async (req, res, next) => {
    try {
        const removedCourse = await db.models.course.destroy({
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

courseController.handleUpdate = async (req, res, next) => {
    try {
        const updatedCourse = await db.models.course.findOne({
            include: db.models.location,
            where: { id: req.params.id },
        });

        if (!updatedCourse) {
            throw Error('Course not found');
        }

        let location;
        if (hasOneOf(req.body, 'location')) {
            if (isObject(req.body.location) && hasOneOf(req.body.location, 'id', 'name')) {
                location = await db.models.location.findIfExists(req.body.location);

                if (!location) {
                    throw Error('Location does not exist');
                }
            } else {
                throw Error('"location" object (with "name" or "id" field) is required to update the location');
            }
            await updatedCourse.setLocation(location);
        }

        const result = await updatedCourse.update(req.body, {
            include: db.models.location,
            fields: allowedToWrite,
        });

        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
};

module.exports = courseController;
