import express from 'express';
import db from 'sequelize-connect';
import bodyParser from 'body-parser';

import path from 'path';

import locationController from './locations/location.controller';
import courseController from './courses/course.controller';

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

    app.get('/api/private/locations', locationController.handleGet);
    app.get('/api/private/locations/:id', locationController.handleGetId);
    app.post('/api/private/locations', locationController.handlePost);
    app.delete('/api/private/locations/:id', locationController.handleDelete);
    app.put('/api/private/locations/:id', locationController.handleUpdate);

    app.get('/api/private/courses', courseController.handleGet);
    app.get('/api/private/courses/:id', courseController.handleGetId);
    app.post('/api/private/courses', courseController.handlePost);
    app.delete('/api/private/courses/:id', courseController.handleDelete);

    app.listen(port, () => console.log(`Running on port ${port}`));
})();
