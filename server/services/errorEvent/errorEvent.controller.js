import { getAllErrorEvents } from "./errorEvent.service";

export async function handleGetAllErrorEvents(req, res, next) {
    try {
        const result = await getAllErrorEvents();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
