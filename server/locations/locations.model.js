export const pluckPublicFields = ({ id, name }) => ({ id, name });

export default function createLocationModel(sequelize, DataTypes) {
    const location = sequelize.define('location', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Location name must be unique!',
            },
        },
        calendarId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Location calendar ID must be unique!',
            },
        },
    }, {
        timestamps: true,
        classMethods: {
            findIfExists: (locationRequest) => {
                // given a location request object return a promise with result
                // expects a VALID locationRequest object with either "id" or "name"
                const loc = sequelize.models.location.findOne({
                    where: {
                        $or: [
                            { id: locationRequest.id },
                            { name: locationRequest.name },
                        ],
                    },
                });
                return loc;
            },
        },
        instanceMethods: {
            async hasAny(model) {
                const hasAny = await model.findOne({
                    where: { locationId: this.id },
                });

                return !!hasAny;
            },

            async isSafeToDelete() {
                const { tutor: Tutor, course: Course, schedule: Schedule } = sequelize.models;
                const conditions = await Promise.all([Tutor, Course, Schedule].map(this.hasAny.bind(this)));

                return conditions.every(c => c === false);
            },
        },
    });
    return location;
}
