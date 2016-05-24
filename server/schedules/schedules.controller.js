import db from 'sequelize-connect';
import aux from '../aux';

const scheduleController = {};

const Schedule = db.models.schedule;
const Location = db.models.location;
const Tutor = db.models.tutor;

const allowedToRead = ['id', 'weekday', 'time', 'location', 'tutors'];
const allowedToWrite = ['weekday', 'time'];
const relatedModels = [{ model: Location, as: 'location' },
                       { model: Tutor, as: 'tutors' }];

const extractDataValues = aux.extractDataValues(allowedToRead);
const isObject = aux.isObject;
const hasOneOf = aux.hasOneOf;

scheduleController.handleGet = async (req, res, next) => {
    try {
        const schedulesRes = await Schedule.findAll({
            include: relatedModels,
        });
        const schedules = schedulesRes.map((schedule) => extractDataValues(schedule));

        res.status(200).json(schedules);
    } catch (err) {
        next(err);
    }
};

scheduleController.handleGetId = async (req, res, next) => {
    try {
        const scheduleRes = await Schedule.find({
            include: relatedModels,
            where: { id: req.params.id },
        });
        if (scheduleRes) {
            res.status(200).json(extractDataValues(scheduleRes));
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        next(err);
    }
};

scheduleController.handlePost = async (req, res, next) => {
    try {
        if (!isObject(req.body.location)) {
            throw Error('"location" object (with "name" or "id" field) is required');
        }

        const location = await Location.findIfExists(req.body.location);

        if (!location) {
            throw Error('Selected location does not exist');
        }

        const createdSchedule = Schedule.build(req.body, {
            fields: allowedToWrite,
        });
        await createdSchedule.setLocation(location, { save: false });
        await createdSchedule.save();

        res.status(201).json(extractDataValues(createdSchedule));
    } catch (err) {
        next(err);
    }
};

scheduleController.handleDelete = async (req, res, next) => {
    try {
        const removedSchedule = await Schedule.destroy({
            where: { id: req.params.id },
        });
        if (removedSchedule) {
            res.status(200).json({});
        } else {
            res.status(400).json({});
        }
    } catch (err) {
        next(err);
    }
};

scheduleController.handleUpdate = async (req, res, next) => {
    try {
        const updatedSchedule = await Schedule.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (!updatedSchedule) {
            throw Error('Schedule not found');
        }

        // updating location
        if (hasOneOf(req.body, 'location')) {
            let location;
            if (isObject(req.body.location) && hasOneOf(req.body.location, 'id', 'name')) {
                location = await Location.findIfExists(req.body.location);
                if (!location) {
                    throw Error('Location does not exists');
                }
            } else {
                throw Error('"location" object (with "name" or "id" field) is required to update the location');
            }
            await updatedSchedule.setLocation(location);
        }
        // updating tutors
        if (hasOneOf(req.body, 'tutors')) {
            if (isObject(req.body.tutors) && (hasOneOf(req.body.tutors[0], 'id') || req.body.courses.tutors === 0)) {
                // check if first element of the array is a valid tutor object
                await updatedSchedule.setTutors(req.body.tutors.map((tutor) => tutor.id));
            } else {
                throw Error('"tutors" must be an array with tutor objects that have "id" properties');
            }
        }
        const result = await updatedSchedule.update(req.body, {
            include: relatedModels,
            fields: allowedToWrite,
        });
        res.status(200).json(extractDataValues(result));
    } catch (err) {
        next(err);
    }
};

module.exports = scheduleController;
