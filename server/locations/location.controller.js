import db from 'sequelize-connect';

const locationController = {};

locationController.handleGet = async (req, res, next) => {
    try {
        const locationsRes = await db.models.location.findAll();
        const locations = locationsRes.map((loc) => loc.dataValues);
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
            res.status(200).json(location.dataValues);
        } else {
            res.status(404).json({});
        }
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

locationController.handlePost = (req, res, next) => {
    db.sequelize.transaction(async (transaction) => {
        try {
            // TODO: add verification

            const createdLocation = await db.models.location.create({
                name: req.body.name,
            }, {
                transaction,
            });
            res.status(201).json({
                id: createdLocation.dataValues.id,
                name: createdLocation.dataValues.name,
            });
        } catch (err) {
            next(err);
        }
    });
};

locationController.handleUpdate = async (req, res, next) => {
    try {
        const updatedLocation = await db.models.location.update({
            name: req.body.name,
        }, {
            where: { id: req.params.id },
        });
        console.log(updatedLocation);

        if (updatedLocation[0]) {
            res.status(200).json({
                id: req.params.id,
                name: req.body.name,
            });
        } else {
            throw (Error('Location not found'));
        }
        res.status(200);
    } catch (err) {
        next(err);
    }
};

module.exports = locationController;
