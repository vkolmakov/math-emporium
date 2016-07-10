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
        }
    }, {
        timestamps: false,
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
    });
    return location;
}
