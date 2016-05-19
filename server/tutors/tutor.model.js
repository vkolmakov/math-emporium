export default function createTutorModel(sequelize, DataTypes) {
    const tutor = sequelize.define('tutor', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        classMethods: {
            associate(models) {
                tutor.belongsToMany(models.course, { through: 'tutor_course' });
                tutor.belongsToMany(models.schedule, { through: 'schedule_tutor' });
                tutor.belongsTo(models.location);
            },
        },
    });

    return tutor;
}
