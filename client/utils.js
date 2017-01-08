import { browserHistory } from 'react-router';

export const courseComparator = (course1, course2) => {
    const getCourseCodeNameAndNumber = code => {
        const courseCodeRegexp = /([a-z]+)([0-9]+)/;
        const mo = code.toLowerCase().match(courseCodeRegexp);
        const [_, name, number] = mo
            ? mo
            : [null, code.toLowerCase(), null];

        return {
            name,
            number: parseInt(number, 10),
        };
    };

    const [{ code: code1 }, { code: code2 }] = [course1, course2];
    const { name: name1, number: number1 } = getCourseCodeNameAndNumber(code1);
    const { name: name2, number: number2 } = getCourseCodeNameAndNumber(code2);

    if (name1 > name2) {
        return 1;
    } else if (name1 < name2) {
        return -1;
    }

    if (number1 > number2) {
        return 1;
    } else if (number1 < number2) {
        return -1;
    } else {
        return 0;
    }
};

export const selectTransformOptions = (valueKey = 'id', labelKey = 'name', colorKey = null) => options =>
    options.map(
        option => Object.keys(option).reduce((result, key) => {
            if (key === valueKey) {
                result.value = option[key];
            } else if (key === labelKey) {
                result.label = option[key];
            } else if (colorKey && key === colorKey) {
                result.color = option[key];
            }
            return result;
        }, {})
    );

export const locationComparator = (location1, location2) =>
    location1.name.toLowerCase() > location2.name.toLowerCase() ? 1 : -1;

export const redirectTo = page => browserHistory.push(page);

export const noop = _ => _;
