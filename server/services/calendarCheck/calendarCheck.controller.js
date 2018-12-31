import { dateTime } from "../../aux";
import { actionFailed } from "../errorMessages";

/**
 * @desc Measured in days. Restriction is added due to Google Calendar API
 * restricting the number of events that could be possibly fetched. If the distance
 * is too large and includes too many calendar events, we might end up missing events.
 */
const MAX_DISTANCE_FOR_CALENDAR_CHECK = 14;

const scheduleCheckResult = {
    unit() {
        return { invalidScheduleEntries: [] };
    },

    createInvalidScheduleEntry(invalidTutorNames, scheduleOverride) {
        return {
            invalidTutorNames,
            directCalendarEventLink: scheduleOverride.directCalendarEventLink,
            timestamp: dateTime.toTimestamp(
                scheduleOverride.startDateTimeObject
            ),
        };
    },
};

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

function createScheduleOverridesReducer(validTutorNames) {
    const validTutorNamesLowerCase = new Set(
        validTutorNames.map((name) => name.toLowerCase())
    );

    const isValidTutorName = (tutorName) =>
        validTutorNamesLowerCase.has(String(tutorName).toLowerCase());

    return function reduceScheduleOverride(result, scheduleOverride) {
        const invalidTutorNames = scheduleOverride.overwriteTutors
            .filter((tutor) => !isValidTutorName(tutor.name))
            .map((tutor) => tutor.name);

        if (invalidTutorNames.length > 0) {
            const invalidScheduleEntry = scheduleCheckResult.createInvalidScheduleEntry(
                invalidTutorNames,
                scheduleOverride
            );

            result.invalidScheduleEntries.push(invalidScheduleEntry);
        }

        return result;
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
            dateTime.differenceInDays(startDate, endDate) <=
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
        const requestInputOrValidationErrors = getValidatedRequestInputOrValidationErrors(
            req.query
        );

        const handleError = (reason) =>
            next(actionFailed("perform", "schedule check", reason));

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

        const getValidTutorNamesForLocation = (id) => {
            return mainStorage.db.models.tutor
                .findAll({
                    where: { locationId: id },
                })
                .then((tutors) => tutors.map((t) => t.name));
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
            .then((scheduleOverrides) =>
                getValidTutorNamesForLocation(locationId).then(
                    (validTutorNames) =>
                        scheduleOverrides.reduce(
                            createScheduleOverridesReducer(validTutorNames),
                            scheduleCheckResult.unit()
                        )
                )
            )
            .then((result) => res.status(200).json(result))
            .catch(handleError);
    },

    appointmentsCheck(req, res, next) {
        res.status(200).json("Checking appointments");
    },
});
