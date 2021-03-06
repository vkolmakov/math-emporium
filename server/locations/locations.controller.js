import db from "sequelize-connect";
import { createExtractDataValuesFunction } from "../aux";
import { notFound, actionFailed } from "../services/errorMessages";
import { pluckPublicFields, isActive } from "./locations.model";

const allowedToRead = [
    "id",
    "name",
    "calendarId",
    "pictureLink",
    "phone",
    "email",
    "address",
    "description",
    "isActive",
    "maximumAppointmentsPerLocation",
    "maximumAppointmentsPerSubject",
    "maximumAppointmentsPerCourse",
];

const allowedToWrite = [
    "name",
    "calendarId",
    "pictureLink",
    "phone",
    "email",
    "address",
    "description",
    "isActive",
    "maximumAppointmentsPerLocation",
    "maximumAppointmentsPerSubject",
    "maximumAppointmentsPerCourse",
];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

const Location = db.models.location;

export const getLocations = () =>
    new Promise(async (resolve) => {
        const locationsRes = await Location.findAll();
        resolve(locationsRes.map((loc) => extractDataValues(loc)));
    });

export const getLocation = (id) =>
    new Promise(async (resolve, reject) => {
        const location = await Location.findOne({
            where: { id },
        });

        if (location) {
            resolve(extractDataValues(location));
        } else {
            reject(notFound("location"));
        }
    });

export const createLocation = (body) =>
    new Promise(async (resolve, reject) => {
        try {
            const createdLocation = await Location.create(body, {
                fields: allowedToWrite,
            });
            resolve(extractDataValues(createdLocation));
        } catch (err) {
            if (err.message) {
                reject(actionFailed("create", "location", err.message));
            }
        }
    });

export const deleteLocation = (id) =>
    new Promise(async (resolve, reject) => {
        const locationToDelete = await Location.findOne({
            where: { id },
        });

        const isSafeToDelete = await locationToDelete.isSafeToDelete();

        if (isSafeToDelete) {
            const removedLocation = await Location.destroy({
                where: { id },
            });
            if (removedLocation) {
                resolve({ id });
            } else {
                reject(notFound("location"));
            }
        } else {
            reject(
                actionFailed(
                    "remove",
                    "location",
                    "there are some tutors/courses/schedules associated with this location"
                )
            );
        }
    });

export const updateLocation = (id, body) =>
    new Promise(async (resolve, reject) => {
        try {
            const updatedLocation = await Location.update(body, {
                fields: allowedToWrite,
                where: { id },
            });

            if (updatedLocation[0]) {
                resolve({ id, name: body.name });
            } else {
                reject(notFound("location"));
            }
        } catch (err) {
            if (err.message) {
                reject(actionFailed("update", "location", err.message));
            }
        }
    });

export const handleGet = async (req, res, next) => {
    try {
        const locations = await getLocations();
        res.status(200).json(locations);
    } catch (err) {
        next(err);
    }
};

export const handlePublicGet = async (req, res, next) => {
    try {
        const locations = await getLocations();
        res.status(200).json(locations.filter(isActive).map(pluckPublicFields));
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const location = await getLocation(req.params.id);
        res.status(200).json(location);
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        const createdLocation = await createLocation(req.body);
        res.status(201).json(createdLocation);
    } catch (err) {
        next(err);
    }
};

export const handleDelete = async (req, res, next) => {
    try {
        const deletedLocation = await deleteLocation(req.params.id);
        res.status(200).json(deletedLocation);
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedLocation = await updateLocation(req.params.id, req.body);
        res.status(200).json(updatedLocation);
    } catch (err) {
        next(err);
    }
};
