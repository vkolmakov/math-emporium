import { dateTime } from "../../aux";

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
                return reduceSpecialInstruction(result, specialInstruction);
            }

            const appointment = calendarEventToAppointment(calendarEvent);
            if (appointment) {
                return reduceAppointment(result, appointment);
            }

            return reduceUnrecognizedCalendarEvent(result, calendarEvent);
        };
    },
};

export default calendarCheckResult;
