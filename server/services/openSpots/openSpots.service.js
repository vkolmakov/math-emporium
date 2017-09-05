import moment from 'moment';

import { TIMEZONE, R, Either } from '../../aux';
import { getCachedData } from '../appData';
import { getAppointments, getSpecialInstructions } from '../appointments/appointments.service';
import { calendarService } from '../googleApis.js';


export function predictTutorName(options, rawName) {
    const createSearchStartRegex = p => new RegExp(`^${p}`, 'i');
    const createSearchEndRegex = p => new RegExp(`${p}$`, 'i');
    const isMatching = regex => s => s.match(regex);

    // for safe regex construction
    const name = rawName.replace(/[^a-zA-Z0-9\s]/gi, '').trim();

    const searchFromStart = (current, upTo) => {
        const sliceStart = R.slice(0, upTo);

        const isMatch = isMatching(
            createSearchStartRegex(sliceStart(name)));

        const next = current.filter(isMatch);

        const areThereAnyOptionsLeft = next.length === 0;
        return areThereAnyOptionsLeft
            ? current
            : next;
    };

    const checkLastLetter = remaining => {
        const isMatch = isMatching(
            createSearchEndRegex(R.last(name)));
        return remaining.filter(isMatch);
    };

    const [searchStart, searchEnd] = [1, 6];
    const afterSearchingFromStart =
          R.range(searchStart, searchEnd).reduce(searchFromStart, options);

    if (afterSearchingFromStart.length === 1) {
        return Either.Right(R.head(afterSearchingFromStart));
    }

    const afterCheckingLastLetter = checkLastLetter(
        afterSearchingFromStart);

    return afterCheckingLastLetter.length === 1
        ? Either.Right(R.head(afterCheckingLastLetter))
        : Either.Left('Could not converge on a single tutor name');
}

export function canTutorCourse(tutors, course, tutor) {
    const { id: courseId } = course;
    const { id: tutorId, name } = tutor;
    const hasCourse = R.compose(
        R.contains(courseId),
        R.map(R.prop('id')),
        R.prop('courses'));

    const selectedTutors = tutors.filter(hasCourse);
    const tutorNames = tutors.map(R.prop('name'));
    const selectedTutorNames = selectedTutors.map(R.prop('name'));

    const canFindNameInSelectedTutors =
          Either.either(
              _ => false,
              n => R.contains(n, selectedTutorNames),
              predictTutorName(tutorNames, name));

    return tutorId
        ? R.contains(tutorId, selectedTutors.map(R.prop('id')))
        : canFindNameInSelectedTutors;
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
        return R.append(
            R.map(transformMapEntry, [...weekdayMap.entries()]),
            acc);
    };
    return R.flatten(
        R.reduce(foldWeekdayToList, [], [...scheduleMap.entries()]));
}

function findExistingTutorByName(tutors, nameToFind) {
    const knownTutorNames = tutors.map(R.prop('name'));
    const findTutorByName = name => R.find(R.propEq('name', name), tutors);
    const getNameAndId = R.pick(['name', 'id']);

    return R.map(
        R.compose(getNameAndId, findTutorByName),
        predictTutorName(knownTutorNames, nameToFind));
}

function specialInstructionsToSchedules(tutors, specialInstructions) {
    const replaceWithExistingTutor = R.compose(
        R.curry(findExistingTutorByName)(tutors),
        R.prop('name'));

    const convert = ({ overwriteTutors, weekday, time }) => ({
        tutors: Either.rights(R.map(replaceWithExistingTutor, overwriteTutors)),
        weekday,
        time,
    });

    return R.map(convert, specialInstructions);
}

export function getOpenSpots(schedules, tutors, appointments, specialInstructions, parameters) {
    const { course } = parameters;

    const canTutorSelectedCourse = R.curry(canTutorCourse)(tutors, course);
    const countSelectedTutors = R.compose(R.length, R.filter(canTutorSelectedCourse));
    const knownTutorNames = R.map(R.prop('name'), tutors);
    const isKnownTutorName = name => Either.either(
        () => false,
        () => true,
        predictTutorName(knownTutorNames, name));


    const applySpecialInstructions = specialInstructions => scheduleMap => {
        const processInstruction = (acc, instruction) => {
            const { overwriteTutors, weekday, time } = instruction;
            const overwrittenCount = countSelectedTutors(overwriteTutors);

            acc.get(weekday).set(time, overwrittenCount);

            return acc;
        };

        return R.reduce(
            processInstruction,
            new Map(scheduleMap),
            specialInstructions);
    };

    const removeScheduledTutors = appointments => scheduleMap => {
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

        return R.reduce(
            processAppointment,
            new Map(scheduleMap),
            appointments);
    };

    const updateScheduleMap = R.pipe(
        applySpecialInstructions(specialInstructions),
        removeScheduledTutors(appointments));

    const scheduleMap =
          updateScheduleMap(
              buildScheduleMap(countSelectedTutors, schedules));

    const renameCounts = ({ weekday, time, tutors }) => ({
        weekday,
        time,
        count: tutors,
    });

    const createOpenSpots = R.compose(
        R.map(renameCounts), convertScheduleMapToList);

    return createOpenSpots(scheduleMap);
}

export async function openSpots(location, course, startDate, endDate) {
    /* location: { id: Number },
       course: { id: Number },
       startDate: moment Date,
       endDate: moment Date,
     */
    moment.tz.setDefault(TIMEZONE);
    const data = await getCachedData();

    const locationData = data.find(d => d.location.id === location.id);

    if (!locationData) {
        throw new Error('Selected location does not exist');
    }

    const calendarId = locationData.location.calendarId;
    const calendar = await calendarService();
    const calendarEvents = await calendar.getCalendarEvents(
        calendarId,
        startDate.toISOString(),
        endDate.toISOString());

    const specialInstructions = getSpecialInstructions(calendarEvents);
    const appointments = getAppointments(calendarEvents);
    const { tutors } = locationData;
    const schedules = specialInstructionsToSchedules(tutors, specialInstructions);

    const parameters = {
        course,
    };

    return getOpenSpots(
        schedules, tutors, appointments, [], parameters);
}

export function getAvailableTutors(schedules, tutors, appointments, specialInstructions, parameters) {
    const { time, weekday, course } = parameters;

    const canTutorSelectedCourse = R.curry(canTutorCourse)(tutors, course);
    const selectTutorsForCourse = R.filter(canTutorSelectedCourse);
    const selectedTutors = selectTutorsForCourse(tutors);
    const selectedTutorNames = R.map(R.prop('name'), selectedTutors);

    const applySpecialInstructions = specialInstructions => scheduleMap => {
        const replaceWithExistingTutor = R.compose(
            R.curry(findExistingTutorByName)(tutors), // TODO: fix
            R.prop('name'));

        const processInstruction = (acc, instruction) => {
            const { overwriteTutors, weekday, time } = instruction;
            const overwrittenTutors = R.map(replaceWithExistingTutor,
                                            overwriteTutors);

            acc.get(weekday).set(time, Either.rights(overwrittenTutors));

            return acc;
        };

        return R.reduce(
            processInstruction,
            new Map(scheduleMap),
            specialInstructions);
    };

    const removeScheduledTutors = appointments => scheduleMap => {
        const compareTutorsByName = R.eqProps('name');
        const predictTutorFromAppointment = appointment =>
              R.map(
                  n => ({ name: n }),
                  predictTutorName(selectedTutorNames, appointment.tutor));

        const takenTutors =
              Either.rights(R.map(predictTutorFromAppointment, appointments));
        const scheduledTutors = scheduleMap.get(weekday).get(time);
        const availableTutors = R.differenceWith(
            compareTutorsByName, scheduledTutors, takenTutors);

        const nextScheduleMap = new Map(scheduleMap);
        nextScheduleMap.get(weekday).set(time, availableTutors);

        return nextScheduleMap;
    };

    const updateScheduleMap = R.pipe(
        applySpecialInstructions(specialInstructions),
        removeScheduledTutors(appointments));

    let availableTutors;
    try {
        const scheduleMap = buildScheduleMap(selectTutorsForCourse, schedules);
        availableTutors = updateScheduleMap(scheduleMap).get(weekday).get(time);
    } catch (e) {
        // selected schedule does not exist anymore
        availableTutors = [];
    }

    return availableTutors;
}

export async function availableTutors(location, course, startDate, endDate) {
    /* location: { id: Number },
       course: { id: Number },
       startDate: moment Date,
       endDate: moment Date,
    */
    moment.tz.setDefault(TIMEZONE);
    const data = await getCachedData();
    const locationData = data.find(d => d.location.id === location.id);

    if (!locationData) {
        throw new Error('Selected location does not exist');
    }

    const calendarId = locationData.location.calendarId;
    const calendar = await calendarService();
    const calendarEvents = await calendar.getCalendarEvents(
        calendarId,
        startDate.toISOString(),
        endDate.toISOString());

    const specialInstructions = getSpecialInstructions(calendarEvents);
    const appointments = getAppointments(calendarEvents);

    // Convert time and weekday into a format that is stored in the database schedule model
    const time = moment(startDate).hours() * 60 + moment(startDate).minutes();
    const weekday = parseInt(moment(startDate).format('E'), 10);

    const parameters = {
        time,
        weekday,
        course,
    };

    const { tutors } = locationData;
    const schedules = specialInstructionsToSchedules(tutors, specialInstructions);

    return getAvailableTutors(
        schedules, tutors, appointments, [], parameters);
}
