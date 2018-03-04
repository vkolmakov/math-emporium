import pg from 'pg';

import * as data from './data';
import { R, runInOrder } from '../utils';

import config from '../../../server/config.js';
import _mainStorage from '../../../server/services/mainStorage';

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

function insertRecords(model, records) {
    return () => model.bulkCreate(records);
}

const mainStorage = {
    name: 'main-storage',

    dbConfig: {
        user: config.db.USER,
        defaultDatabase: 'postgres',

        database: config.db.NAME,
    },

    async setup() {
        const client = await getClient(mainStorage.dbConfig);

        await client.query(createDatabaseQuery(mainStorage.dbConfig));
        await client.end();

        // create tables
        await _mainStorage.connect();

        const Location = _mainStorage.db.models.location;
        const Subject = _mainStorage.db.models.subject;
        const Course = _mainStorage.db.models.course;
        const Tutor = _mainStorage.db.models.tutor;

        const models = [
            Location, Subject, Course, Tutor,
        ];

        const records = [
            data.locations, data.subjects, data.courses, data.tutors,
        ];

        await runInOrder((f) => f.call())(R.zipWith(insertRecords, models, records));

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
