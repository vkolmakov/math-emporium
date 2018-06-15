import pg from "pg";

import config from "../../../server/config.js";
import _mainStorage from "../../../server/services/mainStorage";

function getClient(dbConfig) {
    function runRawQuery(client, queryText) {
        return new Promise((resolve, reject) => {
            client.query(queryText, (queryErr, result) => {
                if (queryErr) {
                    reject(queryErr);
                }

                resolve(result);
            });
        });
    }

    const createConnectionString = ({ user, defaultDatabase }) =>
        `postgres://${user}@localhost/${defaultDatabase}`;

    const client = new pg.Client(createConnectionString(dbConfig));

    return new Promise((resolve, reject) => {
        client.connect((err) => {
            if (err) {
                reject(err);
            }
            resolve({
                end: () => Promise.resolve(client.end()),
                query: (queryText) => runRawQuery(client, queryText),
            });
        });
    });
}

function createDatabaseQuery(dbConfig) {
    return `CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.user}`;
}

function dropDatabaseQuery(dbConfig) {
    return `DROP DATABASE ${dbConfig.database}`;
}

const mainStorage = {
    name: "main-storage",

    dbConfig: {
        user: config.db.USER,
        defaultDatabase: "postgres",

        database: config.db.NAME,
    },

    insertRecords(model, records) {
        return () => model.bulkCreate(records);
    },

    insertTutorCourseLinks(links) {
        const createLink = (link) => {
            const { tutorId, courseId } = link;

            return mainStorage.models.Tutor.findOne({
                where: { id: tutorId },
            }).then((tutor) => tutor.setCourses([courseId]));
        };

        return () => Promise.all(links.map(createLink));
    },

    models: {
        Location: null,
        Subject: null,
        Course: null,
        Tutor: null,
        User: null,
    },

    async setup() {
        const client = await getClient(mainStorage.dbConfig);

        await client.query(createDatabaseQuery(mainStorage.dbConfig));
        await client.end();

        // create tables
        await _mainStorage.connect();

        mainStorage.models.Location = _mainStorage.db.models.location;
        mainStorage.models.Subject = _mainStorage.db.models.subject;
        mainStorage.models.Course = _mainStorage.db.models.course;
        mainStorage.models.Tutor = _mainStorage.db.models.tutor;
        mainStorage.models.User = _mainStorage.db.models.user;

        return Promise.resolve();
    },

    async teardown() {
        const client = await getClient(mainStorage.dbConfig);

        await client.query(dropDatabaseQuery(mainStorage.dbConfig));

        await client.end();
        return Promise.resolve();
    },
};

export default mainStorage;
