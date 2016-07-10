import { openSpots } from './openSpots.service';


export const getOpenSpots = async (req, res, next) => {
    try {
        const data = await openSpots(1, 1);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}
