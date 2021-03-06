import moment from "moment";

import { TIMESTAMP_FORMAT, sanitizeCalendarInput } from "../../aux";

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

        const startDateTime = moment(item.start.dateTime);
        const appointment = {
            ...appointmentInfo,
            startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
            weekday: parseInt(startDateTime.format("E"), 10),
            time: startDateTime.hours() * 60 + startDateTime.minutes(),
        };

        return results.concat(appointment);
    }, []);

    return appointments;
}

function extractSpecialInstructions(summary) {
    if (!summary) {
        return null;
    }

    const instructionsRegex = /^_\d+\((.+?)\)$/;
    const match = summary.trim().match(instructionsRegex);

    if (!match) {
        return null;
    }

    return {
        overwriteTutors: match[1].split("_").map((tutorName) => ({
            name: sanitizeCalendarInput(tutorName),
        })),
    };
}

export function getSpecialInstructions(calendarEvents) {
    const specialInstructions = calendarEvents.reduce((results, item) => {
        const instructionsInfo = extractSpecialInstructions(item.summary);
        if (!instructionsInfo) {
            return results;
        }

        const startDateTime = moment(item.start.dateTime);
        const instructions = {
            ...instructionsInfo,
            startDateTime: startDateTime.format(TIMESTAMP_FORMAT),
            weekday: parseInt(startDateTime.format("E"), 10),
            time: startDateTime.hours() * 60 + startDateTime.minutes(),
        };

        return results.concat(instructions);
    }, []);

    return specialInstructions;
}
