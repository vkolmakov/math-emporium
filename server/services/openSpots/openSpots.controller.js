import { openSpots } from './openSpots.service';
import moment from 'moment';

export const getOpenSpots = async (req, res, next) => {
    /* required request body:
       {
          location: { id },
          course: { id },
          startTime: 'YYYY-MM-DD',
       }
     */
    const locationId = req.body.location.id;
    const courseId = req.body.course.id;
    const startTime = moment(req.body.startTime, 'YYYY-MM-DD');
    const endTime = moment(startTime).add(7, 'days');

    try {
        const data = await openSpots(locationId,
                                     courseId,
                                     startTime,
                                     endTime);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}
