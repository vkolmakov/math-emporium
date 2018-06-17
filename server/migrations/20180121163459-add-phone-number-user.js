const USERS_TABLE_NAME = "users";
const PHONE_NUMBER_COLUMN_NAME = "phoneNumber";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            USERS_TABLE_NAME,
            PHONE_NUMBER_COLUMN_NAME,
            { type: Sequelize.STRING }
        );
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn(
            USERS_TABLE_NAME,
            PHONE_NUMBER_COLUMN_NAME
        );
    },
};
