import db from 'sequelize-connect';
import cache from 'memory-cache';

import { set, createExtractDataValuesFunction } from '../aux';

const collectData = () => new Promise(async (resolve, reject) => {
    const Location = db.models.location;
    const Tutor = db.models.tutor;
    const Schedule = db.models.schedule;
    const Course = db.models.course;

    const extractLocation = createExtractDataValuesFunction(['id', 'name', 'calendarId']);
    const extractCourse = createExtractDataValuesFunction(['id', 'name', 'code', 'color']);
    const extractTutor = createExtractDataValuesFunction(['id', 'name', 'courses']);
    const extractSchedule = createExtractDataValuesFunction(['id', 'weekday', 'time', 'tutors']);

    try {
        const locationsRes = await Location.findAll();
        const locations = locationsRes.map(locationRes => extractLocation(locationRes));

        let data = locations.map(location => new Promise(async (resolve, reject) => {
            const coursesRes = await Course.findAll({
                where: {
                    locationId: location.id,
                },
            });

            const courses = coursesRes
                      .map(courseRes => extractCourse(courseRes));

            const tutorsRes = await Tutor.findAll({
                where: { locationId: location.id },
                include: [{ model: Course, as: 'courses' }],
            });

            const tutors = tutorsRes
                      .map(tutorRes => extractTutor(tutorRes))
                      .map(tutor => set(tutor, 'courses', tutor.courses.map(course => extractCourse(course))));

            const schedulesRes = await Schedule.findAll({
                where: { locationId: location.id },
                include: [{ model: Tutor, as: 'tutors' }],
            });

            const schedules = schedulesRes
                      .map(scheduleRes => extractSchedule(scheduleRes))
                      .map(schedule => set(schedule, 'tutors', schedule.tutors.map(tutor => extractTutor(tutor))));
            resolve({
                location,
                courses,
                tutors,
                schedules,
            });
        }));

        data = await Promise.all(data);
        resolve(data);
    } catch (err) {
        reject(err);
    }
});

export const getCachedData = () => new Promise(async (resolve, reject) => {
    const DATA_KEY = 'data';
    let data = cache.get(DATA_KEY);

    if (!data) {
        try {
            data = await collectData();
        } catch (err) {
            reject(err);
        }
        cache.put(DATA_KEY, data, 0.5 * 60000, () => {
            getCachedData(); // refresh cache automatically every two hours
        });
    }

    resolve(data);
});
