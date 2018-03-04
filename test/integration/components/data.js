import faker from 'faker';
import { R, randomInRange } from '../utils';

const KNOWN_CALENDAR_ID = 'CUSTOM_ID';

const NUM_LOCATIONS = 3;
const NUM_SUBJECTS = 6;
const NUM_COURSES = 12;
const NUM_TUTORS = 4;

const ARBITRARY_LOCATION_ID = 1;
const ARBITRARY_SUBJECT_ID = 1;

function makeLocation(calendarId = faker.internet.exampleEmail()) {
    return {
        calendarId,
        name: faker.company.companyName(),
        pictureLink: faker.image.cats(),
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

function makeCourse(locationId = randomInRange(1, NUM_LOCATIONS),
                    subjectId = randomInRange(1, NUM_SUBJECTS)) {
    const name = faker.random.word();

    return {
        name,
        code: `${R.take(2, name).toUpperCase()}${faker.random.number() % 500}`,
        color: faker.internet.color(),
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

export const locations = [
    makeLocation(KNOWN_CALENDAR_ID),
    ...R.times(() => makeLocation(), NUM_LOCATIONS - 1),
];

export const subjects = [
    makeSubject(ARBITRARY_LOCATION_ID),
    ...R.times(() => makeSubject(), NUM_SUBJECTS - 1),
];

export const courses = [
    makeCourse(ARBITRARY_LOCATION_ID, ARBITRARY_SUBJECT_ID),
    ...R.times(() => makeCourse(), NUM_COURSES - 1),
];

export const tutors = [
    makeTutor(ARBITRARY_LOCATION_ID),
    ...R.times(() => makeTutor(), NUM_TUTORS - 1),
];
