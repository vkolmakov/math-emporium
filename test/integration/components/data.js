import faker from "faker";
import { R, randomInRange } from "../utils";

const NUM_LOCATIONS = 3;
const NUM_SUBJECTS = 6;
const NUM_COURSES = 12;
const NUM_TUTORS = 4;

function makeLocation(calendarId = faker.internet.exampleEmail()) {
    return {
        calendarId,
        name: faker.company.companyName(),
        pictureLink: "",
        phone: faker.phone.phoneNumber(),
        email: faker.internet.exampleEmail(),
        address: faker.address.streetAddress(),
        description: faker.company.bs(),
        isActive: true,
    };
}

function makeSubject(locationId = randomInRange(1, NUM_LOCATIONS)) {
    return {
        name: faker.company.bsNoun(),
        locationId,
    };
}

function makeCourse(
    locationId = randomInRange(1, NUM_LOCATIONS),
    subjectId = randomInRange(1, NUM_SUBJECTS),
) {
    const name = faker.random.word();

    return {
        name,
        code: `${R.take(2, name).toUpperCase()}${faker.random.number() % 500}`,
        color: randomInRange(1, 11).toString(),
        locationId,
        subjectId,
    };
}

function makeTutor(locationId = randomInRange(1, NUM_LOCATIONS)) {
    return {
        name: `${faker.name.firstName()}${R.head(faker.name.lastName())}`,
        locationId,
    };
}

function withOneBasedId(xs) {
    return xs.map((x, i) => ({ ...x, id: i + 1 }));
}

export const GUARANTEED_ITEMS = {
    LOCATION: 1,
    COURSE: 1,
    SUBJECT: 1,
};

export const getLocations = (knownCalendarId) =>
    withOneBasedId([
        makeLocation(knownCalendarId),
        ...R.times(() => makeLocation(), NUM_LOCATIONS - 1),
    ]);

export const getSubjects = () =>
    withOneBasedId([
        // guarantee at least one subject with a known location
        makeSubject(GUARANTEED_ITEMS.LOCATION),
        ...R.times(() => makeSubject(), NUM_SUBJECTS - 1),
    ]);

export const getCourses = () =>
    withOneBasedId([
        // guarantee at least one course with known location+subject
        makeCourse(GUARANTEED_ITEMS.LOCATION, GUARANTEED_ITEMS.SUBJECT),
        ...R.times(() => makeCourse(), NUM_COURSES - 1),
    ]);

export const getTutors = () =>
    withOneBasedId([
        // guarantee at least one tutor with a known location
        makeTutor(GUARANTEED_ITEMS.LOCATION),
        ...R.times(() => makeTutor(), NUM_TUTORS - 1),
    ]);

export const getSchedules = (locations, tutors, startTimes) =>
    withOneBasedId([
        // only one schedule with tutors from guaranteed location
        {
            location: locations[0],
            tutors: tutors.filter(
                (t) => t.locationId === GUARANTEED_ITEMS.LOCATION,
            ),
            time: startTimes[0],
        },
    ]);

export const getTutorCourseLinks = (tutors) =>
    tutors
        .filter((tutor) => tutor.locationId === GUARANTEED_ITEMS.LOCATION)
        // guarantee that tutors from a known location can tutor a known course
        .map((tutor) => ({
            tutorId: tutor.id,
            courseId: GUARANTEED_ITEMS.COURSE,
        }));

export const fakeData = {
    phoneNumber: faker.phone.phoneNumberFormat(),
};
