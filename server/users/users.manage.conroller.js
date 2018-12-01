import db from "sequelize-connect";
import { dateTime } from "../aux";
import { notFound } from "../services/errorMessages";

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;

const allowedToWrite = ["group"];
const relatedModels = [Location, Course];

function toUserListEntry(userDatabaseRes) {
    return {
        id: userDatabaseRes.id,
        email: userDatabaseRes.email,
        group: userDatabaseRes.group,
        lastSigninTimestamp: dateTime.toTimestamp(userDatabaseRes.lastSigninAt),
    };
}

function toUserDetailEntry(userDatabaseRes) {
    return {
        id: userDatabaseRes.id,
        email: userDatabaseRes.email,
        group: userDatabaseRes.group,
        phoneNumber: userDatabaseRes.phoneNumber,
        firstName: userDatabaseRes.firstName,
        lastName: userDatabaseRes.lastName,
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
        const userId = parseInt(req.params.id, 10);
        const updatedUsers = await User.update(req.body, {
            fields: allowedToWrite,
            where: { id: userId },
        });

        if (updatedUsers[0]) {
            res.status(200).json({ id: userId });
        } else {
            res.status(404).json(notFound("user"));
        }
    } catch (err) {
        next(err);
    }
};
