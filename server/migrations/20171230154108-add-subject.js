const R = require("ramda");

module.exports = {
    up: (queryInterface, Sequelize) => {
        const courseCodeToSubjectValue = (code) => {
            const codeRegexp = /([A-Za-z]+)\d+/;
            const mo = code.match(codeRegexp);

            return mo ? mo[1] : code;
        };

        return queryInterface
            .createTable("subjects", {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: Sequelize.STRING,
                },
                locationId: {
                    type: Sequelize.INTEGER,
                    references: { model: "locations", key: "id" },
                },
                createdAt: {
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                },
            })
            .then(() => {
                return queryInterface.sequelize.query(
                    'SELECT "code", "locationId" FROM "courses"',
                );
            })
            .then((r) => {
                const pairs = r[0].map((x) => [
                    x.code,
                    {
                        subjectName: courseCodeToSubjectValue(x.code),
                        locationId: x.locationId,
                    },
                ]);
                const toInsert = R.uniq(pairs.map((p) => p[1]));

                return Promise.all([
                    Promise.resolve(pairs),
                    queryInterface.bulkInsert(
                        "subjects",
                        toInsert.map(({ subjectName, locationId }) => ({
                            name: subjectName,
                            locationId,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })),
                    ),
                ]);
            })
            .then(([codeWithSubjectNameAndLocationId]) => {
                return Promise.all([
                    Promise.resolve(codeWithSubjectNameAndLocationId),
                    queryInterface.sequelize.query(
                        "SELECT name, id FROM subjects",
                    ),
                ]);
            })
            .then(([codeToSubject, result]) => {
                const getSubjectId = (name) =>
                    result[0].find((r) => r.name === name).id;
                const codeToSubjectId = new Map(
                    codeToSubject.map(([c, n]) => [
                        c,
                        getSubjectId(n.subjectName),
                    ]),
                );

                const addSubjectColumn = () =>
                    queryInterface.addColumn("courses", "subjectId", {
                        type: Sequelize.INTEGER,
                        references: { model: "subjects", key: "id" },
                    });

                const setSubjects = () =>
                    Promise.all(
                        Array.from(codeToSubjectId.keys()).map((code) => {
                            return queryInterface.sequelize.query(
                                'UPDATE courses SET "subjectId" = :subjectId WHERE "code" = :code',
                                {
                                    replacements: {
                                        subjectId: codeToSubjectId.get(code),
                                        code,
                                    },
                                },
                            );
                        }),
                    );

                return addSubjectColumn().then(setSubjects);
            });
    },

    down: (queryInterface) =>
        queryInterface
            .removeColumn("courses", "subjectId")
            .then(queryInterface.dropTable("subjects")),
};
