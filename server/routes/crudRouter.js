import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { authGroups } from '../aux';

export default function createCrudRouter(modelName) {
    const controller = require(`../${modelName}/${modelName}.controller`);
    const router = express.Router();

    const modelsWithPublicGet = ['locations', 'courses'];

    if (modelsWithPublicGet.includes(modelName)) {
        router.get(`/public/${modelName}`,
                   controller.handlePublicGet);
    }

    router.get(`/${modelName}`,
               requireGroup(authGroups.EMPLOYEE),
               controller.handleGet);
    router.get(`/${modelName}/:id`,
               requireGroup(authGroups.EMPLOYER),
               controller.handleGetId);
    router.post(`/${modelName}`,
                requireGroup(authGroups.EMPLOYER),
                controller.handlePost);
    router.delete(`/${modelName}/:id`,
                  requireGroup(authGroups.EMPLOYER),
                  controller.handleDelete);
    router.put(`/${modelName}/:id`,
               requireGroup(authGroups.EMPLOYER),
               controller.handleUpdate);

    return router;
}
