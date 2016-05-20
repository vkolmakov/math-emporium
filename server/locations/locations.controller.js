import db from 'sequelize-connect';
import aux from '../aux';

const locationController = {};
const allowedToRead = ['id', 'name'];
const allowedToWrite = ['name'];

const extractDataValues = aux.extractDataValues(allowedToRead);

locationController.handleGet = async (req, res, next) => {
    try {
        const locationsRes = await db.models.location.findAll();
        const locations = locationsRes.map((loc) => extractDataValues(loc));

        res.status(200).json(locations);
    } catch (err) {
        next(err);
    }
};

locationController.handleGetId = async (req, res, next) => {
    try {
        const location = await db.models.location.findOne({
            where: { id: req.params.id },
        });

        if (location) {
            res.status(200).json(extractDataValues(location));
        } else {
            res.status(404).json({});
        }
    } catch (err) {
        next(err);
    }
};

locationController.handlePost = async (req, res, next) => {
    try {
        // TODO: add verification
        const createdLocation = await db.models.location.create(req.body, {
            fields: allowedToWrite,
        });

        res.status(201).json(extractDataValues(createdLocation));
    } catch (err) {
        next(err);
    }
};

locationController.handleDelete = async (req, res, next) => {
    try {
        const removedLocation = await db.models.location.destroy({
            where: { id: req.params.id },
        });
        if (removedLocation) {
            // TODO: send proper success message
            res.status(200).json({});
        } else {
            // TODO: send proper error message
            res.status(404).json({});
        }
    } catch (err) {
        next(err);
    }
};

locationController.handleUpdate = async (req, res, next) => {
    try {
        const updatedLocation = await db.models.location.update(req.body, {
            fields: allowedToWrite,
            where: { id: req.params.id },
        });

        if (updatedLocation[0]) {
            res.status(200).json({
                id: req.params.id,
                name: req.body.name,
            });
        } else {
            throw (Error('Location not found'));
        }
        // TODO: send a better response
        res.status(200);
    } catch (err) {
        next(err);
    }
};

module.exports = locationController;
