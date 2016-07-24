import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

export default function createUserRouter() {
    const controller = require('../users/users.controller');
    const router = express.Router();

    router.get('/user/profile', requireGroup(AUTH_GROUPS.user), controller.getProfile);
    router.put('/user/profile', requireGroup(AUTH_GROUPS.user), controller.updateProfile);

    router.post('/user/appointment', requireGroup(AUTH_GROUPS.user), controller.scheduleAppointment);
    router.delete('/user/appointment', requireGroup(AUTH_GROUPS.user), controller.deleteAppointment);

    return router;
}
