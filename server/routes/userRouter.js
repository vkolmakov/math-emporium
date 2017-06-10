import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { logEvent } from '../middleware/eventLogger';
import { authGroups, events } from '../aux';

export default function createUserRouter() {
    const controller = require('../users/users.controller');
    const router = express.Router();

    router.get('/user/profile',
               requireGroup(AUTH_GROUPS.user),
               controller.getProfile);
    router.put('/user/profile',
               requireGroup(AUTH_GROUPS.user),
               controller.updateProfile);

    router.post('/user/appointment',
                requireGroup(AUTH_GROUPS.user),
                logEvent(events.USER_CREATED_APPOINTMENT),
                controller.scheduleAppointment);
    router.delete('/user/appointment',
                  requireGroup(AUTH_GROUPS.user),
                  logEvent(events.USER_REMOVED_APPOINTMENT),
                  controller.deleteAppointment);

    return router;
}
