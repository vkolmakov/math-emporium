import pg from 'pg';

import config from '../../../server/config.js';

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
