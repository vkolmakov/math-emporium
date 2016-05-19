export default function createScheduleModel(sequelize, DataTypes) {
    const schedule = sequelize.define('schedule', {
        weekday: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            // time is a number of minutes after midnight
            type: DataTypes.INTEGER,
            allowNull: false,
            get() {
                // returns military time string in HH:mm format
                const minAfterMidnight = this.getDataValue('time');
                return `${Math.floor(minAfterMidnight / 60)}:${minAfterMidnight % 60}`;
            },
        },
    }, {
        timestamps: false,
        classMethods: {
            associate(models) {
                schedule.belongsToMany(models.tutor, { through: 'schedule_tutor' });
                schedule.belongsTo(models.location);
            },
        },
    });
    return schedule;
}
