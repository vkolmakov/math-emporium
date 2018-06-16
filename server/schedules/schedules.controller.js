import db from "sequelize-connect";
import {
    createExtractDataValuesFunction,
    isObject,
    hasOneOf,
    transformRequestToQuery,
} from "../aux";
import {
    notFound,
    actionFailed,
    errorMessage,
} from "../services/errorMessages";

const Schedule = db.models.schedule;
const Location = db.models.location;
const Tutor = db.models.tutor;

const allowedToRead = ["id", "weekday", "time", "location", "tutors"];
const allowedToWrite = ["weekday", "time"];
const relatedModels = [
    { model: Location, as: "location" },
    { model: Tutor, as: "tutors" },
];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const handleGet = async (req, res, next) => {
    try {
        const schedulesRes = await Schedule.findAll({
            where: transformRequestToQuery(req.body),
            include: relatedModels,
        });
        const schedules = schedulesRes.map((schedule) =>
            extractDataValues(schedule),
        );

        res.status(200).json(schedules);
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const scheduleRes = await Schedule.find({
            include: relatedModels,
            where: { id: req.params.id },
        });
        if (scheduleRes) {
            res.status(200).json(extractDataValues(scheduleRes));
        } else {
            res.status(404).json(notFound("schedule"));
        }
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        const schedules = req.body;
        const firstSchedule = schedules[0];

        if (!isObject(firstSchedule.location)) {
            throw Error(
                '"location" object (with "name" or "id" field) is required',
            );
        }

        const location = await Location.findIfExists(firstSchedule.location);
        const hasTutors =
            hasOneOf(firstSchedule, "tutors") &&
            isObject(firstSchedule.tutors) &&
            hasOneOf(firstSchedule.tutors[0], "id");

        if (!location) {
            res.status(422).json(notFound("location"));
        }

        const createdSchedulesPromise = schedules.map((schedule) => {
            return new Promise(async (resolve) => {
                const createdSchedule = Schedule.build(schedule, {
                    fields: allowedToWrite,
                });

                await createdSchedule.setLocation(location, { save: false });
                await createdSchedule.save();

                if (hasTutors) {
                    await createdSchedule.setTutors(
                        schedule.tutors.map((tutor) => tutor.id),
                    );
                }

                resolve(createdSchedule);
            });
        });

        const createdSchedules = await Promise.all(createdSchedulesPromise);
        res.status(201).json(createdSchedules.map(extractDataValues));
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
        const removedSchedule = await Schedule.destroy({
            where: { id: req.params.id },
        });
        if (removedSchedule) {
            res.status(200).json({ id: req.params.id });
        } else {
            res.status(400).json(actionFailed("remove", "schedule"));
        }
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedSchedule = await Schedule.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (!updatedSchedule) {
            res.status(422).json(notFound("schedule"));
        }

        // updating location
        if (hasOneOf(req.body, "location")) {
            let location;
            if (
                isObject(req.body.location) &&
                hasOneOf(req.body.location, "id", "name")
            ) {
                location = await Location.findIfExists(req.body.location);
                if (!location) {
                    res.status(422).json(notFound("location"));
                }
            } else {
                res.status(422).json(notFound("location"));
            }
            await updatedSchedule.setLocation(location);
        }
        // updating tutors
        if (hasOneOf(req.body, "tutors")) {
            if (
                isObject(req.body.tutors) &&
                (hasOneOf(req.body.tutors[0], "id") ||
                    req.body.courses.tutors === 0)
            ) {
                // check if first element of the array is a valid tutor object
                await updatedSchedule.setTutors(
                    req.body.tutors.map((tutor) => tutor.id),
                );
            } else {
                res.status(422).json(actionFailed("process", "tutors"));
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
