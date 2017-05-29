import moment from 'moment';

import { openSpots, availableTutors } from './openSpots.service';
import { TIMESTAMP_FORMAT, TIMEZONE } from '../../aux';

export const handleGetOpenSpots = async (req, res, next) => {
    /* required request params:
       {
          location: { id },
          course: { id },
          startDate: aux.TIMESTAMP_FORMAT: String,
       }
     */
    moment.tz.setDefault(TIMEZONE);

    const locationId = parseInt(req.query.locationId, 10);
    const courseId = parseInt(req.query.courseId, 10);
    const startDate = moment(req.query.startDate, TIMESTAMP_FORMAT);
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
};

export const handleGetAvailableTutors = async (req, res, next) => {
    moment.tz.setDefault(TIMEZONE);

    const time = moment(req.query.time, TIMESTAMP_FORMAT);
    const course = { id: parseInt(req.query.courseId, 10) };
    const location = { id: parseInt(req.query.locationId, 10) };

    try {
        const tutors = await availableTutors(
            time,
            course,
            location,
        );
        res.status(200).json(tutors.map(tutor => ({ name: tutor.name, id: tutor.id })));
    } catch (err) {
        next(err);
    }
};
