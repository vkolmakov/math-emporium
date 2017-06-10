import express from 'express';
import requireGroup from '../middleware/requireGroup';
import { authGroups } from '../aux';

import { handleGetOpenSpots, handleGetAvailableTutors } from '../services/openSpots/openSpots.controller';
import { handleGetAppointments } from '../services/appointments/appointments.controller';
import { handleGetChromeExtensionData } from '../services/chromeExtensionData/chromeExtensionData.controller';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/open-spots',
               handleGetOpenSpots);
    router.get('/available-tutors',
               handleGetAvailableTutors);

    router.get('/appointments',
               requireGroup(authGroups.EMPLOYER),
               handleGetAppointments);
    router.get('/chrome-extension-data',
               requireGroup(authGroups.EMPLOYER),
               handleGetChromeExtensionData);

    return router;
}
