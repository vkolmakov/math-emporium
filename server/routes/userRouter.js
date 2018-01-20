import express from 'express';

import requireGroup from '../middleware/requireGroup';
import createEventLogger from '../middleware/logEvent';
import { authGroups, events } from '../aux';

export default function createUserRouter() {
    const controller = require('../users/users.controller');
    const router = express.Router();

    router.get('/user/profile',
               requireGroup(authGroups.USER),
               controller.getProfile());
    router.put('/user/profile',
               requireGroup(authGroups.USER),
               controller.updateProfile());

    router.post('/user/appointment',
                requireGroup(authGroups.USER),
                controller.scheduleAppointment(createEventLogger(events.USER_CREATED_APPOINTMENT)));
    router.delete('/user/appointment',
                  requireGroup(authGroups.USER),
                  controller.deleteAppointment(createEventLogger(events.USER_REMOVED_APPOINTMENT)));

    return router;
}
