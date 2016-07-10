import express from 'express';
import { openSpots } from '../services/controllers/openSpots';

export default function createUtilRouter() {
    const router = express.Router();

    router.get('/public/openSpots', openSpots);

    return router;
}
