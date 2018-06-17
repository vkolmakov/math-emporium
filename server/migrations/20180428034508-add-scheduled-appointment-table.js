const TABLE_NAME = "users";
const removedColumns = (Sequelize) => [
    {
        name: "googleCalendarAppointmentId",
        options: { type: Sequelize.STRING },
    },
    { name: "googleCalendarId", options: { type: Sequelize.STRING } },
    {
        name: "googleCalendarAppointmentDate",
        options: { type: Sequelize.STRING },
    },
];

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((t) => {
            const removeWithTransaction = (column) =>
                queryInterface.removeColumn(TABLE_NAME, column.name, {
                    transaction: t,
                });

            return Promise.all(
                removedColumns(Sequelize).map(removeWithTransaction)
            );
        }),

    down: (queryInterface, Sequelize) =>
        queryInterface.sequelize.transaction((t) => {
            const addWithTransaction = (column) =>
                queryInterface.addColumn(
                    TABLE_NAME,
                    column.name,
                    column.options,
                    { transaction: t }
                );

            return Promise.all(
                removedColumns(Sequelize).map(addWithTransaction)
            );
        }),
};
