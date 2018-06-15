import mainStorage from "../services/mainStorage";

import {
    createExtractDataValuesFunction,
    isObject,
    hasOneOf,
    transformRequestToQuery,
} from "../aux";
import { notFound, isRequired, actionFailed } from "../services/errorMessages";
import { pluckPublicFields, isActive } from "./subjects.model";

const Location = mainStorage.db.models.location;
const Subject = mainStorage.db.models.subject;

const allowedToRead = ["id", "name", "location"];
const allowedToWrite = ["name"];
const relatedModels = [Location];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

function getSubjects(body) {
    return new Promise(async (resolve) => {
        const subjectsRes = await Subject.findAll({
            where: transformRequestToQuery(body),
            include: relatedModels,
        });
        resolve(subjectsRes.map((subjectRes) => extractDataValues(subjectRes)));
    });
}

function getSubject(id) {
    return new Promise(async (resolve, reject) => {
        const subject = await Subject.findOne({
            include: relatedModels,
            where: { id },
        });

        if (subject) {
            resolve(extractDataValues(subject));
        } else {
            reject(notFound("Subject"));
        }
    });
}

function createSubject(body) {
    return new Promise(async (resolve, reject) => {
        if (
            !isObject(body.location) ||
            !hasOneOf(body.location, "name", "id")
        ) {
            reject(isRequired("Location"));
        }

        const location = await Location.findIfExists(body.location);

        if (!location) {
            reject(notFound("Location"));
        }

        const createdSubject = Subject.build(body, {
            fields: allowedToWrite,
        });

        await createdSubject.setLocation(location, { save: false });

        try {
            await createdSubject.save();
            resolve(extractDataValues(createdSubject));
        } catch (err) {
            // caught a validation error
            reject(actionFailed("create", "subject", err.message));
        }
    });
}

function deleteSubject(id) {
    return new Promise(async (resolve, reject) => {
        const removedSubject = await Subject.destroy({
            where: { id },
        });

        if (removedSubject) {
            resolve({ id });
        } else {
            reject(actionFailed("remove", "subject"));
        }
    });
}

function updateSubject(id, body) {
    return new Promise(async (resolve, reject) => {
        const updatedSubject = await Subject.findOne({
            include: relatedModels,
            where: { id },
        });

        if (!updatedSubject) {
            reject(notFound("Subject"));
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
            await updatedSubject.setLocation(location);
        }

        let result;
        try {
            result = await updatedSubject.update(body, {
                include: relatedModels,
                fields: allowedToWrite,
            });
            resolve(extractDataValues(result));
        } catch (err) {
            // caught a validation error
            reject(actionFailed("update", "subject", err.message));
        }
    });
}

export const handleGet = async (req, res, next) => {
    try {
        const subjects = await getSubjects(req.body);
        res.status(200).json(subjects);
    } catch (err) {
        next(err);
    }
};

export const handlePublicGet = async (req, res, next) => {
    try {
        const subjects = await getSubjects(req.body);
        res.status(200).json(subjects.filter(isActive).map(pluckPublicFields));
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const subject = await getSubject(req.params.id);
        res.status(200).json(subject);
    } catch (err) {
        next(err);
    }
};

export const handlePost = async (req, res, next) => {
    try {
        const createdSubject = await createSubject(req.body);
        res.status(201).json(extractDataValues(createdSubject));
    } catch (err) {
        next(err);
    }
};

export const handleDelete = async (req, res, next) => {
    try {
        const deletedSubject = await deleteSubject(req.params.id);
        res.status(200).json(deletedSubject);
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedSubject = await updateSubject(req.params.id, req.body);
        res.status(200).json(updatedSubject);
    } catch (err) {
        next(err);
    }
};
