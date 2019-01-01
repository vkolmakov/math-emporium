import { dateTime } from "../../aux";
import { actionFailed, notFound, isCustomError } from "../errorMessages";

/**
 * @desc Measured in days. Restriction is added due to Google Calendar API
 * restricting the number of events that could be possibly fetched. If the distance
 * is too large and includes too many calendar events, we might end up missing events.
 */
const MAX_DISTANCE_FOR_CALENDAR_CHECK = 14;

const calendarCheckResult = {
    unit() {
        return {
            invalidSchedules: [],
            invalidAppointments: [],
            unrecognizedCalendarEvents: [],
        };
    },

    createInvalidSchedulesEntry(invalidTutorNames, scheduleOverride) {
        return {
            invalidTutorNames,
            directCalendarEventLink: scheduleOverride.directCalendarEventLink,
            timestamp: dateTime.toTimestamp(
                scheduleOverride.startDateTimeObject
            ),
        };
    },

    createInvalidAppointmentsEntry(invalidTutorName, appointment) {
        return {
            invalidTutorName,
            directCalendarEventLink: appointment.directCalendarEventLink,
            timestamp: dateTime.toTimestamp(appointment.startDateTimeObject),
        };
    },

    createUnrecognizedCalendarEventsEntry(calendarEvent) {
        return {
            directCalendarEventLink: calendarEvent.htmlLink,
            summary: calendarEvent.summary,
            timestamp: dateTime.toTimestamp(
                dateTime.fromISOString(calendarEvent.start.dateTime)
            ),
        };
    },
};

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

function createCalendarEventsReducer(
    validTutorNames,
    calendarEventToSpecialInstruction,
    calendarEventToAppointment
) {
    const validTutorNamesLowerCase = new Set(
        validTutorNames.map((name) => name.toLowerCase())
    );

    const isValidTutorName = (tutorName) =>
        validTutorNamesLowerCase.has(String(tutorName).toLowerCase());

    const reduceSpecialInstruction = (result, specialInstruction) => {
        // For now this is the only type of special instruction
        let scheduleOverride = specialInstruction;

        const invalidTutorNames = scheduleOverride.overwriteTutors
            .filter((tutor) => !isValidTutorName(tutor.name))
            .map((tutor) => tutor.name);

        if (invalidTutorNames.length > 0) {
            const invalidSchedulesEntry = calendarCheckResult.createInvalidSchedulesEntry(
                invalidTutorNames,
                scheduleOverride
            );

            result.invalidSchedules.push(invalidSchedulesEntry);
        }

        return result;
    };

    const reduceAppointment = (result, appointment) => {
        const hasValidTutorName =
            appointment.tutor && isValidTutorName(appointment.tutor);

        if (!hasValidTutorName) {
            const invalidAppointmentsEntry = calendarCheckResult.createInvalidAppointmentsEntry(
                appointment.tutor,
                appointment
            );
            result.invalidAppointments.push(invalidAppointmentsEntry);
        }

        return result;
    };

    const reduceUnrecognizedCalendarEvent = (result, calendarEvent) => {
        const unrecognizedCalendarEventsEntry = calendarCheckResult.createUnrecognizedCalendarEventsEntry(
            calendarEvent
        );
        result.unrecognizedCalendarEvents.push(unrecognizedCalendarEventsEntry);

        return result;
    };

    return function reduceCalendarEvent(result, calendarEvent) {
        const specialInstruction = calendarEventToSpecialInstruction(
            calendarEvent
        );
        if (specialInstruction) {
            return reduceSpecialInstruction(result, specialInstruction);
        }

        const appointment = calendarEventToAppointment(calendarEvent);
        if (appointment) {
            return reduceAppointment(result, appointment);
        }

        return reduceUnrecognizedCalendarEvent(result, calendarEvent);
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

function createErrorHandler(nextMiddlewareCallback) {
    return function handleError(error) {
        if (isCustomError(error)) {
            return nextMiddlewareCallback(error);
        }
        return nextMiddlewareCallback(
            actionFailed("perform", "schedule check", error)
        );
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
                    createCalendarEventsReducer(
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
