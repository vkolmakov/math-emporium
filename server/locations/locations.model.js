const DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS = {
    LOCATION: 1,
    SUBJECT: 1,
    COURSE: 1,
};

export const pluckPublicFields =
    ({ id, name, pictureLink, phone, email, address, description }) =>
    ({ id, name, pictureLink, phone, email, address, description });

export const isActive = ({ isActive }) => isActive;

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
        pictureLink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        maximumAppointmentsPerLocation: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.LOCATION,
        },
        maximumAppointmentsPerSubject: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.SUBJECT,
            validate: {
                ensureUnderLocationMaximum(value) {
                    if (value > this.maximumAppointmentsPerLocation) {
                        throw new Error('Maximum number of appointments for subject must be at most as large as maximum for the location');
                    }
                },
            },
        },
        maximumAppointmentsPerCourse: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.COURSE,
            validate: {
                ensureUnderSubjectMaximum(value) {
                    if (value > this.maximumAppointmentsPerSubject) {
                        throw new Error('Maximum number of appointments for course must be at most as large as maximum for the subject');
                    }
                },
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
