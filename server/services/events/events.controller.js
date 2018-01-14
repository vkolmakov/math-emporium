import { getAllEvents, getLatestEvents } from './events.service';
import { isRequired } from '../errorMessages';

export async function handleGetAllEvents(req, res, next) {
    try {
        const result = await getAllEvents();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export async function handleGetLatestEvents(req, res, next) {
    try {
        const count = parseInt(req.query.count, 10);

        if (!count || isNaN(count)) {
            throw isRequired('count');
        }

        const result = await getLatestEvents(count);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
