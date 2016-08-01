import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

export default function createManageUserRouter() {
    const controller = require('../users/users.manage.conroller');
    const router = express.Router();

    router.get('/users', requireGroup(AUTH_GROUPS.employer), controller.handleGet);
    router.get('/users/:id', requireGroup(AUTH_GROUPS.employer), controller.handleGetId);
    router.put('/users/:id', requireGroup(AUTH_GROUPS.employer), controller.handleUpdate);

    return router;
}
