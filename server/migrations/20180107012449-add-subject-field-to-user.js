const USERS_TABLE_NAME = "users";
const SUBJECT_ID_COLUMN_NAME = "subjectId";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            USERS_TABLE_NAME,
            SUBJECT_ID_COLUMN_NAME,
            {
                type: Sequelize.INTEGER,
                references: { model: "subjects", key: "id" },
            },
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn(
            USERS_TABLE_NAME,
            SUBJECT_ID_COLUMN_NAME,
        );
    },
};
