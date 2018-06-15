export default function createScheduleModel(sequelize, DataTypes) {
    const schedule = sequelize.define(
        "schedule",
        {
            weekday: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            time: {
                // time is a number of minutes after midnight
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["weekday", "time", "locationId"],
                },
            ],
            classMethods: {
                associate(models) {
                    schedule.belongsToMany(models.tutor, {
                        through: "schedule_tutor",
                        as: "tutors",
                    });
                    schedule.belongsTo(models.location, { as: "location" });
                },
            },
        },
    );
    return schedule;
}
