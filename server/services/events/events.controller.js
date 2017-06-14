import { getAllEvents } from './events.service';


export async function handleGetAllEvents(req, res, next) {
    try {
        const result = await getAllEvents();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
