export default function createTutorModel(sequelize, DataTypes) {
    const tutor = sequelize.define(
        "tutor",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            classMethods: {
                associate(models) {
                    tutor.belongsToMany(models.course, {
                        through: "tutor_course",
                        as: "courses",
                    });
                    tutor.belongsToMany(models.schedule, {
                        through: "schedule_tutor",
                        as: "schedules",
                    });
                    tutor.belongsTo(models.location);
                },
            },
        },
    );

    return tutor;
}
