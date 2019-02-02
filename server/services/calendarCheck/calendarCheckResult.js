import { dateTime } from "../../aux";

function getCalendarEventInformation(calendarEvent) {
    return {
        directCalendarEventLink: calendarEvent.directCalendarEventLink,
        timestamp: dateTime.toTimestamp(calendarEvent.startDateTimeObject),
        calendarEventSummary: calendarEvent.summary,
    };
}

const calendarCheckResult = {
    unit() {
        return {
            invalidSchedules: [],
            invalidAppointments: [],
            unrecognizedCalendarEvents: [],
        };
    },

    createInvalidSchedulesEntry(invalidTutorNames, calendarEvent) {
        return {
            invalidTutorNames,
            ...getCalendarEventInformation(calendarEvent),
        };
    },

    createInvalidAppointmentsEntry(invalidTutorName, calendarEvent) {
        return {
            invalidTutorName,
            ...getCalendarEventInformation(calendarEvent),
        };
    },

    createUnrecognizedCalendarEventsEntry(calendarEvent) {
        return {
            ...getCalendarEventInformation(calendarEvent),
        };
    },

    createCalendarEventsReducer(
        validTutorNames,
        calendarEventToSpecialInstruction,
        calendarEventToAppointment
    ) {
        const validTutorNamesLowerCase = new Set(
            validTutorNames.map((name) => name.toLowerCase())
        );

        const isValidTutorName = (tutorName) =>
            validTutorNamesLowerCase.has(String(tutorName).toLowerCase());

        const reduceSpecialInstruction = (
            result,
            specialInstruction,
            calendarEvent
        ) => {
            // For now this is the only type of special instruction
            let scheduleOverride = specialInstruction;

            const invalidTutorNames = scheduleOverride.overwriteTutors
                .filter((tutor) => !isValidTutorName(tutor.name))
                .map((tutor) => tutor.name);

            if (invalidTutorNames.length > 0) {
                const invalidSchedulesEntry = calendarCheckResult.createInvalidSchedulesEntry(
                    invalidTutorNames,
                    calendarEvent
                );

                result.invalidSchedules.push(invalidSchedulesEntry);
            }

            return result;
        };

        const reduceAppointment = (result, appointment, calendarEvent) => {
            const hasValidTutorName =
                appointment.tutor && isValidTutorName(appointment.tutor);

            if (!hasValidTutorName) {
                const invalidAppointmentsEntry = calendarCheckResult.createInvalidAppointmentsEntry(
                    appointment.tutor,
                    calendarEvent
                );
                result.invalidAppointments.push(invalidAppointmentsEntry);
            }

            return result;
        };

        const reduceUnrecognizedCalendarEvent = (result, calendarEvent) => {
            const unrecognizedCalendarEventsEntry = calendarCheckResult.createUnrecognizedCalendarEventsEntry(
                calendarEvent
            );
            result.unrecognizedCalendarEvents.push(
                unrecognizedCalendarEventsEntry
            );

            return result;
        };

        return function reduceCalendarEvent(result, calendarEvent) {
            const specialInstruction = calendarEventToSpecialInstruction(
                calendarEvent
            );
            if (specialInstruction) {
                return reduceSpecialInstruction(
                    result,
                    specialInstruction,
                    calendarEvent
                );
            }

            const appointment = calendarEventToAppointment(calendarEvent);
            if (appointment) {
                return reduceAppointment(result, appointment, calendarEvent);
            }

            return reduceUnrecognizedCalendarEvent(result, calendarEvent);
        };
    },
};

export default calendarCheckResult;
