import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';

import path from 'path';

import createCrudRouter from './crudRouter';

const app = express();
const port = 3000;

function connect() {
    db.discover = path.join(__dirname);
    db.matcher = (file) => !!file.match(/.+\.model.js/);

    return db.connect('mathcenterappdb', 'postgres', '', {
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

    const crudRoutes = [
        ['locations', 'private'],
        ['courses', 'private'],
        ['tutors', 'private'],
        ['schedules', 'private'],
    ];

    crudRoutes.forEach((routeParams) => app.use('/api', createCrudRouter(...routeParams)));

    app.listen(port, () => console.log(`Running on port ${port}`));
})();
