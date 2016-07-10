import express from 'express';
import { getOpenSpots } from '../services/openSpots/openSpots.controller';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/public/openSpots', getOpenSpots);

    return router;
}
