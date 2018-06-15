import { getAppData } from "../appData";
import { set } from "../../aux";

export const packChromeExtensionData = async () => {
    const data = await getAppData();

    const weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ].reduce(
        (result, weekdayName, idx) => set(result, idx + 1, weekdayName),
        {},
    );

    const packedChromeExtensionData = data.map((locationData) => ({
        location: locationData.location,

        courses: locationData.courses.reduce((result, course) => {
            const { code, name, color } = course;
            const courseKey = `${code}: ${name}`;

            const courseObject = {
                name: courseKey,
                color,
                code,
            };

            return set(result, courseKey, courseObject);
        }, {}),

        schedule: locationData.schedules.reduce((result, schedule) => {
            const weekday = weekdays[schedule.weekday];
            const hour = `${Math.floor(schedule.time / 60)}`;
            const tutors = schedule.tutors.map((tutor) => tutor.name);

            if (!result[weekday]) {
                result[weekday] = {};
            }

            if (!result[weekday][hour]) {
                result[weekday][hour] = [...tutors];
            }

            return result;
        }, {}),

        tutors: locationData.tutors.reduce(
            (result, tutor) =>
                set(
                    result,
                    tutor.name,
                    tutor.courses.map((course) => course.code),
                ),
            {},
        ),
    }));

    return packedChromeExtensionData;
};
