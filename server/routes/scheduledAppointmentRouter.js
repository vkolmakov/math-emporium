import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { authGroups } from '../aux';

import mainStorage from '../services/mainStorage';
import { calendarServiceFactory } from '../services/googleApis';
import scheduledAppointmentsHelper from '../scheduledAppointments/scheduledAppointments.helper';
import ScheduledAppointmentsController from '../scheduledAppointments/scheduledAppointments.controller';

export default function createScheduledAppointmentRouter() {
    const router = express.Router();

    const helper = scheduledAppointmentsHelper(mainStorage, calendarServiceFactory());
    const controller = new ScheduledAppointmentsController(mainStorage, helper);

    router.post('/scheduled-appointment',
                requireGroup(authGroups.USER),
                (req, res, next) => controller.create(req, res, next));
    router.delete('/scheduled-appointment',
                  requireGroup(authGroups.USER),
                  controller.delete.bind(controller));

    return router;
}
