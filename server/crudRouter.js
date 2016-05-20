import express from 'express';

export default function createCrudRouter(modelName, routeType) {
    const controller = require(`./${modelName}/${modelName}.controller`);
    const router = express.Router();

    router.get(`/${routeType}/${modelName}`, controller.handleGet);
    router.get(`/${routeType}/${modelName}/:id`, controller.handleGetId);
    router.post(`/${routeType}/${modelName}`, controller.handlePost);
    router.delete(`/${routeType}/${modelName}/:id`, controller.handleDelete);
    router.put(`/${routeType}/${modelName}/:id`, controller.handleUpdate);

    return router;
}
