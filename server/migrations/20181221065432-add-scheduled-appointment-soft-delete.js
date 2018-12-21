const TABLE_NAME = "scheduledAppointments";
const NEW_COLUMN_NAME = "isDeleted";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(TABLE_NAME, NEW_COLUMN_NAME, {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn(TABLE_NAME, NEW_COLUMN_NAME);
    },
};
