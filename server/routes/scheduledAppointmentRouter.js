import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { authGroups, dateTime } from '../aux';

import mainStorage from '../services/mainStorage';
import { calendarServiceFactory } from '../services/googleApis';
import sendEmail from '../services/email';
import cache from '../services/cache';
import * as openSpotsService from '../services/openSpots/openSpots.service';

import scheduledAppointmentsHelper from '../scheduledAppointments/scheduledAppointments.helper';
import ScheduledAppointmentsController from '../scheduledAppointments/scheduledAppointments.controller';

export default function createScheduledAppointmentRouter() {
    const router = express.Router();

    const helper = scheduledAppointmentsHelper(mainStorage, calendarServiceFactory(), sendEmail, openSpotsService);
    const controller = new ScheduledAppointmentsController(cache, dateTime, helper);

    router.post('/scheduled-appointment',
                requireGroup(authGroups.USER),
                controller.create.bind(controller));
    router.delete('/scheduled-appointment',
                  requireGroup(authGroups.USER),
                  controller.delete.bind(controller));

    return router;
}
