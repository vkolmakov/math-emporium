import db from 'sequelize-connect';

const courseController = {};

courseController.handleGet = async (req, res, next) => {
    try {
        const coursesRes = await db.models.course.findAll();
        const courses = coursesRes.map((course) => course.dataValues);
        res.status(200).json(courses);
    } catch (err) {
        next(err);
    }
};

courseController.handleGetId = async (req, res, next) => {
    try {
        // TODO: verify it's an integer
        const course = await db.models.course.find({
            where: { id: req.params.id },
        });
        if (course) {
            res.status(200).json(course.dataValues);
        } else {
            res.status(404).json({});
        }
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

courseController.handlePost = async (req, res, next) => {
    try {
        const createdCourse = db.models.course.build({
            name: req.body.name,
            code: req.body.code,
            color: req.body.color,
        });
        const location = await db.models.location.findOne({
            where: { id: req.body.location },
        });

        if (location) {
            createdCourse.setLocation(location);
        } else {
            throw Error('Location does not exist');
        }

        await createdCourse.save();

        res.status(201).json({
            id: createdCourse.dataValues.id,
            name: createdCourse.dataValues.name,
            code: createdCourse.dataValues.code,
            color: createdCourse.dataValues.color,
            location: createdCourse.dataValues.locationId,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = courseController;
