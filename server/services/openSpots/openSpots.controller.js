import moment from "moment";

import { openSpots, availableTutors } from "./openSpots.service";
import { TIMESTAMP_FORMAT, TIMEZONE, APPOINTMENT_LENGTH } from "../../aux";

export const handleGetOpenSpots = async (req, res, next) => {
    /* required request params:
         locationId: Number
         courseId: Number
         startDate: aux.TIMESTAMP_FORMAT: String,
     */
    moment.tz.setDefault(TIMEZONE);

    const location = { id: parseInt(req.query.locationId, 10) };
    const course = { id: parseInt(req.query.courseId, 10) };
    const startDate = moment(req.query.startDate, TIMESTAMP_FORMAT);

    const endDate = moment(startDate).add(7, "days");

    try {
        const data = await openSpots(location, course, startDate, endDate);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

export const handleGetAvailableTutors = async (req, res, next) => {
    /* required request params:
       locationId: Number
       courseId: Number
       startDate: aux.TIMESTAMP_FORMAT: String,
    */

    moment.tz.setDefault(TIMEZONE);

    const course = { id: parseInt(req.query.courseId, 10) };
    const location = { id: parseInt(req.query.locationId, 10) };
    const startDate = moment(req.query.time, TIMESTAMP_FORMAT);

    const endDate = moment(startDate).add(APPOINTMENT_LENGTH, "minutes");

    try {
        const tutors = await availableTutors(
            location,
            course,
            startDate,
            endDate
        );
        res.status(200).json(tutors);
    } catch (err) {
        next(err);
    }
};
