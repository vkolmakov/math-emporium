import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';

const requireAuth = passport.authenticate('jwt', { session: false });

export default function createCrudRouter(modelName, routeType) {
    const controller = require(`../${modelName}/${modelName}.controller`);
    const router = express.Router();

    router.get(`/${routeType}/${modelName}`, requireAuth, controller.handleGet);
    router.get(`/${routeType}/${modelName}/:id`, requireAuth, controller.handleGetId);
    router.post(`/${routeType}/${modelName}`, requireAuth, controller.handlePost);
    router.delete(`/${routeType}/${modelName}/:id`, requireAuth, controller.handleDelete);
    router.put(`/${routeType}/${modelName}/:id`, requireAuth, controller.handleUpdate);

    return router;
}
