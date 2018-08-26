const TABLE_NAME = "locations";
const newColumns = (Sequelize) => [
    {
        name: "pictureLink",
        options: { type: Sequelize.STRING, allowNull: true },
    },
    { name: "phone", options: { type: Sequelize.STRING, allowNull: true } },
    { name: "email", options: { type: Sequelize.STRING, allowNull: true } },
    { name: "address", options: { type: Sequelize.STRING, allowNull: true } },
    {
        name: "description",
        options: { type: Sequelize.STRING, allowNull: true },
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
                    { transaction: t }
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
                newColumns(Sequelize).map(removeWithTransaction)
            );
        }),
};
