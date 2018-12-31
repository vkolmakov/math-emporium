import { dateTime } from "../../aux";

const MAX_DISTANCE_FOR_CALENDAR_CHECK = 14;

function getLocationCalendarEvents(
    locationIdToCalendarId,
    getCalendarServicePromise
) {
    return function getLocationCalendarEventsInner(
        locationId,
        startDate,
        endDate
    ) {
        return Promise.all([
            getCalendarServicePromise(),
            locationIdToCalendarId(locationId),
        ]).then(([calendarService, calendarId]) => {
            return calendarService.getCalendarEvents(
                calendarId,
                startDate.toISOString(),
                endDate.toISOString(),
                { useCache: false }
            );
        });
    };
}

export default (
    mainStorage,
    getCalendarServicePromise,
    appointmentsService
) => ({
    scheduleCheck(req, res, next) {
        /**
         * locationId: number
         * startDate: timestamp
         * endDate: timestamp
         */

        /**
         * input
         */
        const locationId = parseInt(req.query.locationId, 10);
        const startDateTimestamp = parseInt(req.query.startDate, 10);
        const endDateTimestamp = parseInt(req.query.endDate, 10);

        // validation
        const startDate = dateTime.fromTimestamp(startDateTimestamp);
        const endDate = dateTime.fromTimestamp(endDateTimestamp);

        // location existence will be checked later
        const hasValidLocationId = !Number.isNaN(locationId);

        const isValidDateInterval =
            dateTime.isValid(startDate) &&
            dateTime.isValid(endDate) &&
            dateTime.isAfter(endDate, startDate) &&
            dateTime.differenceInDays(startDate, endDate) <=
                MAX_DISTANCE_FOR_CALENDAR_CHECK;

        if (!hasValidLocationId || !isValidDateInterval) {
            // TODO: proper error handling
            return res.status(500).json("Invalid Input");
        }

        /**
         * dependencies
         */
        const locationIdToCalendarId = (id) => {
            return mainStorage.db.models.location
                .findOne({
                    where: { id: id },
                })
                .then((location) => location.calendarId);
        };

        const calendarEventsToScheduleOverrides = (calendarEvents) => {
            const specialInstructions = appointmentsService.getSpecialInstructions(
                calendarEvents
            );

            return specialInstructions.filter(
                appointmentsService.isScheduleOverrideSpecialInstruction
            );
        };

        const getCalendarEvents = getLocationCalendarEvents(
            locationIdToCalendarId,
            getCalendarServicePromise
        );

        return getCalendarEvents(locationId, startDate, endDate)
            .then(calendarEventsToScheduleOverrides)
            .then((result) => res.status(200).json(result));
    },

    appointmentsCheck(req, res, next) {
        res.status(200).json("Checking appointments");
    },
});
