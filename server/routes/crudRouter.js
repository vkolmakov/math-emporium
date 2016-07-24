import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

export default function createCrudRouter(modelName) {
    const controller = require(`../${modelName}/${modelName}.controller`);
    const router = express.Router();

    const modelsWithPublicGet = ['locations', 'courses'];

    if (modelsWithPublicGet.indexOf(modelName) > -1) {
        router.get(`/${modelName}`, controller.handleGet);
    } else {
        router.get(`/${modelName}`, requireGroup(AUTH_GROUPS.employee), controller.handleGet);
    }
    router.get(`/${modelName}/:id`, requireGroup(AUTH_GROUPS.employer), controller.handleGetId);
    router.post(`/${modelName}`, requireGroup(AUTH_GROUPS.employer), controller.handlePost);
    router.delete(`/${modelName}/:id`, requireGroup(AUTH_GROUPS.employer), controller.handleDelete);
    router.put(`/${modelName}/:id`, requireGroup(AUTH_GROUPS.employer), controller.handleUpdate);

    return router;
}
