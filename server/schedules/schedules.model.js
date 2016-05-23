export default function createScheduleModel(sequelize, DataTypes) {
    const schedule = sequelize.define('schedule', {
        // TODO: Add custom validator: make sure that there's one and only one
        //       pair of weekday and time for a given location
        weekday: {
            type: DataTypes.INTEGER,
            allowNull: false,
            get() {
                const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                return weekdays[this.getDataValue('weekday')];
            },
            set(weekdayString) {
                const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const idx = weekdays.indexOf(weekdayString.toLowerCase());
                if (idx > -1) {
                    this.setDataValue('weekday', idx);
                } else {
                    throw Error(`Make sure that "weekday" is one of ${weekdays}`);
                }
            },
        },
        time: {
            // time is a number of minutes after midnight
            type: DataTypes.INTEGER,
            allowNull: false,
            get() {
                // returns military time string in HH:mm format
                const minAfterMidnight = this.getDataValue('time');
                const hours = Math.floor(minAfterMidnight / 60);
                const mins = minAfterMidnight % 60;
                // add padding to mins if needed
                return `${hours}:${mins < 10 ? `0${mins}` : mins}`;
            },
            set(timeString) {
                if (!(typeof timeString === 'string' && timeString.length === 5)) {
                    throw Error('time must be a military time string with "HH:mm" format!');
                }
                const [hours, mins] = timeString.split(':');
                this.setDataValue('time', parseInt(hours, 10) * 60 + parseInt(mins, 10));
            },
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
