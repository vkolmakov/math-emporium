export default function createCourseModel(sequelize, DataTypes) {
    const course = sequelize.define('course', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                // TODO: make a custom validator ensure uniqueness only by location
                msg: 'Course code must be unique!',
            },
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        classMethods: {
            associate(models) {
                course.belongsToMany(models.tutor, { through: 'tutor_course' });
                course.belongsTo(models.location);
            },
        },

    });

    return course;
}
