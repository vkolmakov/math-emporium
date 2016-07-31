import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

export default function createManageUserRouter() {
    const controller = require('../users/users.manage.conroller');
    const router = express.Router();

    router.get('/users', controller.handleGet);
    router.get('/users/:id', controller.handleGetId);
    router.put('/users/:id', controller.handleUpdate);

    return router;
}
