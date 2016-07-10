import db from 'sequelize-connect';

import { set, createExtractDataValuesFunction } from '../../aux';

export const packChromeExtensionData = async () => {
    const Location = db.models.location;
    const Tutor = db.models.tutor;
    const Schedule = db.models.schedule;
    const Course = db.models.course;


    const locationsRes = await Location.findAll();
    const locations = locationsRes.map(locationRes => locationRes.dataValues);

    // TODO: Do all of the following with every location and add location constraint in findAll calls

    const coursesRes = await Course.findAll();
    const courses = coursesRes
              .map(courseRes => createExtractDataValuesFunction(['name', 'code', 'color'])(courseRes))
              .reduce((result, course) => set(result, `${course.code}: ${course.name}`, { ...course }), {});
    // TODO: possible problem - name key could be used for display purpose

    const tutorsRes = await Tutor.findAll({
        include: [{ model: Course, as: 'courses' }],
    });
    const tutors = tutorsRes
              .map(tutorRes => createExtractDataValuesFunction(['name', 'courses'])(tutorRes))
              .reduce((result, tutor) => set(result, tutor.name, tutor.courses.map(course => course.dataValues.code)), {});

    const schedulesRes = await Schedule.findAll({
        include: [{ model: Tutor, as: 'tutors' }],
    });
    const schedules = schedulesRes
              .map(scheduleRes => createExtractDataValuesFunction(['weekday', 'time', 'tutors'])(scheduleRes));

    // TODO: transform database values for weekday and time into 'Monday',...,'Friday' and '10',...,'19' respectively
    // TODO: transform tutors objects into just a list of tutornames
    // TODO: reduce to an object with weekdays as keys, that contain objects with hours as keys and values as lists of tutornames

    return {};
};
