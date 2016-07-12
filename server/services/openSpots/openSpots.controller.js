import { openSpots } from './openSpots.service';
import moment from 'moment';

export const getOpenSpots = async (req, res, next) => {
    /* required request params:
       {
          location: { id },
          course: { id },
          startDate: 'YYYY-MM-DD',
       }
     */


    const locationId = parseInt(req.query.locationId, 10);
    const courseId = parseInt(req.query.courseId, 10);
    const startDate = moment(req.query.startDate, 'YYYY-MM-DD');
    const endDate = moment(startDate).add(7, 'days');

    try {
        const data = await openSpots(locationId,
                                     courseId,
                                     startDate,
                                     endDate);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}
