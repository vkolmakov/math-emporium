import moment from 'moment';

import { TIMEZONE, pickOneFrom, range, first, contains,
         prop, map, compose, curry, length, flatten, reduce,
         append, filter, flip } from '../../aux';
import { getCachedData } from '../appData';
import { getAppointments, getSpecialInstructions } from '../appointments/appointments.service';
import { CalendarService } from '../googleApis.js';

export const selectRandomTutor = tutors => {
    if (tutors.length === 0) {
        throw new Error('No available tutors');
    }

    return pickOneFrom(tutors);
};

const predictTutorName = (options, rawName) => {
    const [searchFromIdx, searchUpToIdx] = [2, 6];

    const candidateLists = range(searchFromIdx, searchUpToIdx).reduce((result, num) => {
        const candidates = options.filter(name => name.toLowerCase().startsWith(rawName.toLowerCase().slice(0, num)));
        return candidates.length > 0 ? result.concat([candidates]) : result;
    }, []);

    if (candidateLists.length < 1) {
        return rawName;
    } else {
        const candidates = first(candidateLists.sort((l1, l2) => l1.length - l2.length));
        return selectRandomTutor(candidates);
    }
};

export function canTutorCourse(tutors, course, tutor) {
    const { id: courseId } = course;
    const { id: tutorId, name } = tutor;
    const hasCourse = compose(
        contains(courseId),
        map(prop('id')),
        prop('courses'));

    const selectedTutors = tutors.filter(hasCourse);
    const selectedTutorNames = selectedTutors.map(prop('name'));
    return tutorId
        ? contains(tutorId, selectedTutors.map(prop('id')))
        : contains(predictTutorName(selectedTutorNames, name), selectedTutorNames);
}

export function buildScheduleMap(transformTutors, source) {
    const collectElement = (acc, element) => {
        const { weekday, time, tutors } = element;

        if (acc.has(weekday)) {
            acc.get(weekday).set(time, transformTutors(tutors));
        } else {
            acc.set(weekday, new Map([ [time, transformTutors(tutors)] ]));
        }
        return acc;
    };
    return source.reduce(collectElement, new Map());
}

export function convertScheduleMapToList(scheduleMap) {
    const foldWeekdayToList = (acc, [weekday, weekdayMap]) => {
        const transformMapEntry = ([time, tutors]) => ({
            weekday, time, tutors,
        });
        return append(
            map(transformMapEntry, [...weekdayMap.entries()]),
            acc);
    };
    return flatten(
        reduce(foldWeekdayToList, [], [...scheduleMap.entries()]));
}

export function getOpenSpots(locationData, appointments, specialInstructions, parameters) {
    const { courseId } = parameters;
    const { schedules, tutors } = locationData;

    const course = { id: courseId };
    const canTutorSelectedCourse = curry(canTutorCourse)(tutors, course);
    const countSelectedTutors = compose(length, filter(canTutorSelectedCourse));
    const knownTutorNames = map(prop('name'), tutors);
    const isKnownTutorName = compose(
        flip(contains)(knownTutorNames),
        curry(predictTutorName)(knownTutorNames));

    const applySpecialInstructions = (scheduleMap, specialInstructions) => {
        const processInstruction = (acc, instruction) => {
            const { overwriteTutors, weekday, time } = instruction;
            const overwrittenCount = countSelectedTutors(overwriteTutors);

            acc.get(weekday).set(time, overwrittenCount);

            return acc;
        };

        return reduce(
            processInstruction,
            new Map(scheduleMap),
            specialInstructions);
    };

    const removeScheduledTutors = (scheduleMap, appointments) => {
        const processAppointment = (acc, appointment) => {
            const { tutor: tutorName, weekday, time } = appointment;

            if (!acc.has(weekday) || !acc.get(weekday).has(time)) {
                return acc; // invalid appointment time
            }

            const tutor = { name: tutorName };
            const counts = acc.get(weekday).get(time);
            if (canTutorSelectedCourse(tutor)) {
                // tutor is known and can tutor the selected course, remove from counts
                acc.get(weekday).set(time, counts - 1);
            } else if (isKnownTutorName(tutor.name)) {
                // tutor is known and cannot tutor the course, skip
                acc.get(weekday).set(time, counts);
            } else {
                // not a known tutor name, remove from counts
                acc.get(weekday).set(time, counts - 1);
            }

            return acc;
        };

        return reduce(
            processAppointment,
            new Map(scheduleMap),
            appointments);
    };

    const scheduleMap = removeScheduledTutors(
        applySpecialInstructions(
            buildScheduleMap(countSelectedTutors, schedules),
            specialInstructions),
        appointments);

    const getCounts = ({ weekday, time, tutors }) => ({
        weekday,
        time,
        count: tutors,
    });

    const openSpots = map(getCounts, convertScheduleMapToList(scheduleMap));

    return openSpots;
}

export async function openSpots(locationId, courseId, startDate, endDate) {
    /* locationId: Int,
       courseId: Int,
       startDate: moment Date,
       endDate: moment Date,
     */
    moment.tz.setDefault(TIMEZONE);
    // as of now course and location are passed in as a database ID
    const data = await getCachedData();
    // select the correct data blob
    const locationData = data.find(d => d.location.id === locationId);

    if (!locationData) {
        throw new Error('Selected location does not exist');
    }

    const calendarId = locationData.location.calendarId;

    const calendarService = new CalendarService;
    await calendarService.create();

    const calendarEvents = await calendarService.getCalendarEvents(
        calendarId,
        startDate.toISOString(),
        endDate.toISOString()
    );

    const specialInstructions = getSpecialInstructions(calendarEvents);
    const appointments = getAppointments(calendarEvents);

    const parameters = { locationId, courseId, startDate, endDate };

    return getOpenSpots(locationData, appointments, specialInstructions, parameters);
}

export function getAvailableTutors(locationData, appointments, specialInstructions, parameters) {
    const { time, course } = parameters;
    // Convert time into a format that is stored in the database schedule model
    const timeRaw = moment(time).hours() * 60 + moment(time).minutes();
    // Convert weekday into a format that is stored in the database schedule model
    const weekdayRaw = parseInt(moment(time).format('E'), 10);

    const selectedSchedule = locationData.schedules.find(s => s.weekday === weekdayRaw && s.time === timeRaw);
    if (!selectedSchedule) {
        throw new Error('Schedule not found');
    }

    let scheduledTutors;
    // try to find any special instructions related to this time and date
    const hasSpecialInstructions = specialInstructions.length > 0;
    if (hasSpecialInstructions) {
        // `join` scheduled tutors and location tutors, that is find a complete list of scheduled tutors with
        // all the information
        scheduledTutors = specialInstructions[0].overwriteTutors.reduce(
            (results, scheduledTutor) => {
                // with special instructions try to find tutor by name
                const tutor = locationData.tutors.find(
                    tutor => scheduledTutor.name.toLowerCase() === tutor.name.toLowerCase());
                if (!tutor) {
                    return results;
                }

                return results.concat(tutor);
            }, []);
    } else {
        // same here
        scheduledTutors = selectedSchedule.tutors.map(
            // without special instructions just get tutors by id
            scheduledTutor => locationData.tutors.find(tutor => scheduledTutor.id === tutor.id)
        );
    }

    // filter out tutors that can't tutor a required course
    const filteredScheduledTutors = scheduledTutors.filter(
        tutor => !!tutor.courses.find(c => c.id === course.id)
    );

    const busyTutorsNames = appointments.map(appointment => {
        const { tutor: rawTutorName } = appointment;
        const scheduledTutorNames = scheduledTutors.map(t => t.name);

        return contains(rawTutorName.toLowerCase(), scheduledTutorNames.map(name => name.toLowerCase()))
            ? rawTutorName
            : predictTutorName(scheduledTutorNames, rawTutorName);
    });

    // Keep only tutors whose names are not in the busyTutorsNames array
    const availableTutors = filteredScheduledTutors.filter(
        tutor =>
            !busyTutorsNames.find(name => name.toLowerCase() === tutor.name.toLowerCase())
    );

    return availableTutors;
}

export async function findAvailableTutors(startDate, course, location) {
    moment.tz.setDefault(TIMEZONE);
    const data = await getCachedData();
    const locationData = data.find(d => d.location.id === location.id);

    const calendarId = locationData.location.calendarId;

    const calendarService = new CalendarService;
    await calendarService.create();

    const endDate = moment(startDate).add(1, 'hours');
    const calendarEvents = await calendarService.getCalendarEvents(
        calendarId,
        startDate.toISOString(),
        endDate.toISOString()
    );

    const specialInstructions = getSpecialInstructions(calendarEvents);
    const appointments = getAppointments(calendarEvents);

    const parameters = { time: startDate, course };

    return getAvailableTutors(locationData, appointments, specialInstructions, parameters);
}
