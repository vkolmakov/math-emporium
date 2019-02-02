import { dateTime } from "../../aux";
import { actionFailed, notFound, isCustomError } from "../errorMessages";
import calendarCheckResult from "./calendarCheckResult";

/**
 * @desc Measured in days. Restriction is added due to Google Calendar API
 * restricting the number of events that could be possibly fetched. If the distance
 * is too large and includes too many calendar events, we might end up missing events.
 */
const MAX_DISTANCE_FOR_CALENDAR_CHECK = 14;

function getLocationCalendarEvents(mainStorage, getCalendarServicePromise) {
    const locationIdToCalendarId = (id) => {
        return mainStorage.db.models.location
            .findOne({
                where: { id: id },
            })
            .then((location) => {
                if (!location) {
                    return Promise.reject(notFound("location"));
                }
                return Promise.resolve(location.calendarId);
            });
    };

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

function getValidTutorNamesForLocation(mainStorage) {
    return function getValidTutorNamesForLocationInner(locationId) {
        return mainStorage.db.models.tutor
            .findAll({
                where: { locationId: locationId },
            })
            .then((tutors) => tutors.map((t) => t.name));
    };
}

function toValidationObject(isValid, reason) {
    return { isValid, reason: isValid ? null : reason };
}

function getValidatedRequestInputOrValidationErrors(query) {
    const locationId = parseInt(query.locationId, 10);
    const startDateTimestamp = parseInt(query.startDate, 10);
    const endDateTimestamp = parseInt(query.endDate, 10);

    const startDate = dateTime.fromTimestamp(startDateTimestamp);
    const endDate = dateTime.fromTimestamp(endDateTimestamp);

    // location existence will be checked later

    const validations = [
        toValidationObject(
            !Number.isNaN(locationId),
            "locationId must be a number"
        ),
        toValidationObject(
            dateTime.isValid(startDate),
            "startDate is not a valid timestamp"
        ),
        toValidationObject(
            dateTime.isValid(endDate),
            "endDate is not a valid timestamp"
        ),
        toValidationObject(
            dateTime.isAfter(endDate, startDate),
            "endDate must be larger than startDate"
        ),
        toValidationObject(
            Math.abs(dateTime.differenceInDays(startDate, endDate)) <=
                MAX_DISTANCE_FOR_CALENDAR_CHECK,
            `difference between startDate and endDate must not exceed ${MAX_DISTANCE_FOR_CALENDAR_CHECK} days`
        ),
    ];

    const validationErrorMessages = validations.reduce(
        (result, { isValid, reason }) => {
            if (!isValid) {
                result.push(reason);
            }

            return result;
        },
        []
    );

    if (validationErrorMessages.length > 0) {
        return { errors: validationErrorMessages };
    }

    return { validatedInput: { locationId, startDate, endDate } };
}

function createErrorHandler(nextMiddlewareCallback) {
    return function handleError(err) {
        let errorObject;

        if (isCustomError(err)) {
            /**
             * Because we are inside an admin-level API used to diagnose
             * calendar and location issues, there is no need
             * to follow the regular error handling process which will
             * obscure the errors. For example, if the Google calendar for
             * the selected location is not available, we would want the user
             * to know about it.
             */
            errorObject = actionFailed("perform", "schedule check", err.error);
        } else if (typeof err === "string") {
            /**
             * This is a validation error.
             */
            errorObject = actionFailed("perform", "schedule check", err);
        } else {
            /**
             * In this case, this is not a validation error nor it is
             * a known domain error.
             *
             * With that, going through the regular error handling
             * flow makes more sense as the details of this error
             * are not useful to user of the API.
             */
            errorObject = err;
        }

        return nextMiddlewareCallback(errorObject);
    };
}

export default (
    mainStorage,
    getCalendarServicePromise,
    appointmentsService
) => ({
    calendarCheckHandler(req, res, next) {
        /**
         * locationId: number
         * startDate: timestamp
         * endDate: timestamp
         */
        const requestInputOrValidationErrors = getValidatedRequestInputOrValidationErrors(
            req.query
        );

        const handleError = createErrorHandler(next);

        if (requestInputOrValidationErrors.errors) {
            return handleError(
                requestInputOrValidationErrors.errors.join(", ")
            );
        }

        const {
            locationId,
            startDate,
            endDate,
        } = requestInputOrValidationErrors.validatedInput;

        const getCalendarEvents = getLocationCalendarEvents(
            mainStorage,
            getCalendarServicePromise
        );

        const getValidTutorNames = getValidTutorNamesForLocation(mainStorage);
        const {
            calendarEventToSpecialInstruction,
            calendarEventToAppointment,
        } = appointmentsService;

        const calendarEventsWithValidTutorNamesPromise = Promise.all([
            getCalendarEvents(locationId, startDate, endDate),
            getValidTutorNames(locationId),
        ]);

        return calendarEventsWithValidTutorNamesPromise
            .then(([calendarEvents, validTutorNames]) =>
                calendarEvents.reduce(
                    calendarCheckResult.createCalendarEventsReducer(
                        validTutorNames,
                        calendarEventToSpecialInstruction,
                        calendarEventToAppointment
                    ),
                    calendarCheckResult.unit()
                )
            )
            .then((result) => res.status(200).json(result))
            .catch(handleError);
    },
});
