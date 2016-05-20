import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';

import path from 'path';

import createCrudRouter from './crudRouter';

const app = express();
const port = 3000;

async function connect() {
    db.discover = path.join(__dirname);
    db.matcher = (file) => !!file.match(/.+\.model.js/);

    await db.connect('mathcenterappdb', 'postgres', '', {
        force: false,
        dialect: 'postgres',
    });
}

(async () => {
    try {
        await connect();
    } catch (err) {
        console.log(`Could not connect to the database: ${err}`);
    }

    app.use(bodyParser.json());

    app.use('/api', createCrudRouter('locations', 'private'));
    app.use('/api', createCrudRouter('courses', 'private'));

    app.listen(port, () => console.log(`Running on port ${port}`));
})();
