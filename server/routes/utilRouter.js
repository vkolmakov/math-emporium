import express from 'express';
import { handleGetOpenSpots, handleGetAvailableTutors } from '../services/openSpots/openSpots.controller';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/open-spots', handleGetOpenSpots);
    router.get('/available-tutors', handleGetAvailableTutors);

    return router;
}
