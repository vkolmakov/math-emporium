export default function createScheduleModel(sequelize, DataTypes) {
    const schedule = sequelize.define('schedule', {
        // TODO: Add custom validator: make sure that there's one and only one
        //       pair of weekday and time for a given location
        weekday: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time: {
            // time is a number of minutes after midnight
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
        classMethods: {
            associate(models) {
                schedule.belongsToMany(models.tutor, { through: 'schedule_tutor', as: 'tutors' });
                schedule.belongsTo(models.location, { as: 'location' });
            },
        },
    });
    return schedule;
}
