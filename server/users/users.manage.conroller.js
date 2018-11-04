import db from "sequelize-connect";
import { createExtractDataValuesFunction, dateTime } from "../aux";
import { notFound } from "../services/errorMessages";

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;

const allowedToRead = [
    "id",
    "email",
    "firstName",
    "lastName",
    "group",
    "location",
    "course",
    "lastSigninAt",
    "phoneNumber",
];
const allowedToWrite = ["group"];
const relatedModels = [Location, Course];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

function toUserListEntry(userDatabaseRes) {
    const { id, email, group } = userDatabaseRes;
    return {
        id,
        email,
        group,
        lastSigninTimestamp: dateTime.toTimestamp(userDatabaseRes.lastSigninAt),
    };
}

function toUserDetailEntry(userDatabaseRes) {
    const {
        id,
        email,
        group,
        phoneNumber,
        firstName,
        lastName,
    } = userDatabaseRes;

    return {
        id,
        email,
        group,
        phoneNumber,
        firstName,
        lastName,
        lastSigninTimestamp: dateTime.toTimestamp(userDatabaseRes.lastSigninAt),
    };
}

export const handleGet = async (req, res, next) => {
    try {
        const usersRes = await User.findAll({
            include: relatedModels,
            order: [["lastSigninAt", "DESC"]],
        });
        const users = usersRes.map(toUserListEntry);

        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const userRes = await User.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (userRes) {
            res.status(200).json(toUserDetailEntry(userRes));
        } else {
            res.status(404).json(notFound("User"));
        }
    } catch (err) {
        next(err);
    }
};

export const handleUpdate = async (req, res, next) => {
    try {
        const updatedUser = await User.update(req.body, {
            fields: allowedToWrite,
            where: { id: req.params.id },
        });

        if (updatedUser[0]) {
            res.status(200).json({ id: req.params.id });
        } else {
            res.status(404).json(notFound("user"));
        }
    } catch (err) {
        next(err);
    }
};
