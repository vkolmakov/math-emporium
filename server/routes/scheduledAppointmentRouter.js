import express from 'express';

import requireGroup from '../middleware/requireGroup';
import { authGroups, dateTime } from '../aux';

import mainStorage from '../services/mainStorage';
import { calendarServiceFactory } from '../services/googleApis';
import sendEmail from '../services/email';
import cache from '../services/cache';
import * as openSpotsService from '../services/openSpots/openSpots.service';
import createEventLogger from '../middleware/logEvent';

import scheduledAppointmentsHelper from '../scheduledAppointments/scheduledAppointments.helper';
import ScheduledAppointmentsController from '../scheduledAppointments/scheduledAppointments.controller';

export default function createScheduledAppointmentRouter() {
    const ROUTE_PATH = '/scheduled-appointments';

    const router = express.Router();

    const helper = scheduledAppointmentsHelper(mainStorage, calendarServiceFactory(), sendEmail, openSpotsService);
    const controller = new ScheduledAppointmentsController(cache, dateTime, createEventLogger, helper);

    router.get(ROUTE_PATH,
               requireGroup(authGroups.USER),
               controller.getForUser.bind(controller));
    router.post(ROUTE_PATH,
                requireGroup(authGroups.USER),
                controller.create.bind(controller));
    router.delete(ROUTE_PATH,
                  requireGroup(authGroups.USER),
                  controller.delete.bind(controller));

    return router;
}
