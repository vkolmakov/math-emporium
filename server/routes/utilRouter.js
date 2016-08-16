import express from 'express';
import { getOpenSpots, getAvailableTutors } from '../services/openSpots/openSpots.controller';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/open-spots', getOpenSpots);
    router.get('/available-tutors', getAvailableTutors);

    return router;
}
