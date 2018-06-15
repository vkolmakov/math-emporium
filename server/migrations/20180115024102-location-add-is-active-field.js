const TABLE_NAME = "locations";
const NEW_COLUMN_NAME = "isActive";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(TABLE_NAME, NEW_COLUMN_NAME, {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(TABLE_NAME, NEW_COLUMN_NAME);
    },
};
