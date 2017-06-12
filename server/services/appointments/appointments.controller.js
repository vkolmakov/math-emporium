import moment from 'moment';

import { getAppointments } from './appointments.service';
import { TIMEZONE, TIMESTAMP_FORMAT } from '../../aux';


export async function handleGetAppointments(req, res, next) {
    moment.tz.setDefault(TIMEZONE);

    const locationId = parseInt(req.query.locationId, 10);
    const startDate = moment(req.query.startDate, TIMESTAMP_FORMAT);
    const endDate = moment(startDate).add(7, 'days');

    try {
        const data = await getAppointments({
            locationId,
            startDate,
            endDate,
        });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}
