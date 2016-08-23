import express from 'express';
import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

import { handleGetOpenSpots, handleGetAvailableTutors } from '../services/openSpots/openSpots.controller';
import { handleGetAppointments } from '../services/appointments/appointments.controller';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/open-spots', handleGetOpenSpots);
    router.get('/available-tutors', handleGetAvailableTutors);

    router.get('/appointments', requireGroup(AUTH_GROUPS.employer), handleGetAppointments);

    return router;
}
