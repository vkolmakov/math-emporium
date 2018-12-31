import moment from "moment";

import { TIMESTAMP_FORMAT, sanitizeCalendarInput } from "../../aux";

function getBaseCalendarEventFields(calendarEvent) {
    const startDateTime = moment(calendarEvent.start.dateTime);
    const directCalendarEventLink = calendarEvent.htmlLink;

    return {
        // TODO: track all references to startDateTime and remove them/convert to use startDateTimeObject
        startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
        startDateTimeObject: startDateTime.toDate(),
        directCalendarEventLink,
        weekday: parseInt(startDateTime.format("E"), 10),
        time: startDateTime.hours() * 60 + startDateTime.minutes(),
    };
}

function extractInfoFromSummary(summary) {
    if (!summary) {
        return null;
    }

    const appointmentRegex = /^([A-Za-z].+?)\((.+?)\)(.+)/;
    const match = summary.trim().match(appointmentRegex);

    if (!match) {
        return null;
    }

    return {
        tutor: sanitizeCalendarInput(match[1]),
        student: match[2],
        course: sanitizeCalendarInput(match[3]),
    };
}

export function getAppointments(calendarEvents) {
    const appointments = calendarEvents.reduce((results, item) => {
        const appointmentInfo = extractInfoFromSummary(item.summary);
        if (!appointmentInfo) {
            return results;
        }

        const appointment = {
            ...appointmentInfo,
            ...getBaseCalendarEventFields(item),
        };

        return results.concat(appointment);
    }, []);

    return appointments;
}

function extractSpecialInstructions(summary) {
    if (!summary) {
        return null;
    }

    const overwriteTutorsInstructionRegex = /^_\d+\((.+?)\)$/;
    const match = summary.trim().match(overwriteTutorsInstructionRegex);

    if (!match) {
        return null;
    }

    return {
        overwriteTutors: match[1].split("_").map((tutorName) => ({
            name: sanitizeCalendarInput(tutorName),
        })),
    };
}

export function isScheduleOverrideSpecialInstruction(specialInstruction) {
    return Array.isArray(specialInstruction.overwriteTutors);
}

export function getSpecialInstructions(calendarEvents) {
    const specialInstructions = calendarEvents.reduce((results, item) => {
        const instructionsInfo = extractSpecialInstructions(item.summary);
        if (!instructionsInfo) {
            return results;
        }

        const instructions = {
            ...instructionsInfo,
            ...getBaseCalendarEventFields(item),
        };

        return results.concat(instructions);
    }, []);

    return specialInstructions;
}
