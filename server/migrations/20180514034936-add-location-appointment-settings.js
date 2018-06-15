const TABLE_NAME = "locations";

const DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS = {
    LOCATION: 1,
    SUBJECT: 1,
    COURSE: 1,
};
const newColumns = (Sequelize) => [
    {
        name: "maximumAppointmentsPerLocation",
        options: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.LOCATION,
        },
    },
    {
        name: "maximumAppointmentsPerSubject",
        options: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.SUBJECT,
        },
    },
    {
        name: "maximumAppointmentsPerCourse",
        options: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: DEFAULT_MAXIMUM_NUMBER_OF_APPOINTMENTS.COURSE,
        },
    },
];

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((t) => {
            const addWithTransaction = (column) =>
                queryInterface.addColumn(
                    TABLE_NAME,
                    column.name,
                    column.options,
                    { transaction: t },
                );

            return Promise.all(newColumns(Sequelize).map(addWithTransaction));
        }),

    down: (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((t) => {
            const removeWithTransaction = (column) =>
                queryInterface.removeColumn(TABLE_NAME, column.name, {
                    transaction: t,
                });

            return Promise.all(
                newColumns(Sequelize).map(removeWithTransaction),
            );
        }),
};
