import db from 'sequelize-connect';
import { createExtractDataValuesFunction } from '../aux';
import { notFound } from '../services/errorMessages';

const User = db.models.user;
const Location = db.models.location;
const Course = db.models.course;

const allowedToRead = ['id', 'email', 'firstName', 'lastName', 'group', 'location', 'course'];
const allowedToWrite = ['email', 'group'];
const relatedModels = [Location, Course];

const extractDataValues = createExtractDataValuesFunction(allowedToRead);

export const handleGet = async (req, res, next) => {
    try {
        const usersRes = await User.findAll({
            include: relatedModels,
        });
        const users = usersRes.map(userRes => extractDataValues(userRes));

        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

export const handleGetId = async (req, res, next) => {
    try {
        const user = await User.findOne({
            include: relatedModels,
            where: { id: req.params.id },
        });

        if (user) {
            res.status(200).json(extractDataValues(user));
        } else {
            res.status(404).json(notFound('User'));
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
            res.status(404).json(notFound('user'));
        }
    } catch (err) {
        next(err);
    }
};
