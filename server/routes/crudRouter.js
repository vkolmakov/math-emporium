import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';

const requireAuth = passport.authenticate('jwt', { session: false });

export default function createCrudRouter(modelName) {
    const controller = require(`../${modelName}/${modelName}.controller`);
    const router = express.Router();

    const modelsWithPublicGet = ['locations', 'courses'];

    if (modelsWithPublicGet.indexOf(modelName) > -1) {
        router.get(`/${modelName}`, controller.handleGet);
    } else {
        router.get(`/${modelName}`, requireAuth, controller.handleGet);
    }
    router.get(`/${modelName}/:id`, requireAuth, controller.handleGetId);
    router.post(`/${modelName}`, requireAuth, controller.handlePost);
    router.delete(`/${modelName}/:id`, requireAuth, controller.handleDelete);
    router.put(`/${modelName}/:id`, requireAuth, controller.handleUpdate);

    return router;
}
