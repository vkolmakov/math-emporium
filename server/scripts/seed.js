import fs from "fs";
import mainStorage from "../services/mainStorage";

function readJson(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}

function setKey(obj, key, val) {
    obj[key] = val;
    return obj;
}

function zipObj(keys, vals) {
    return keys.reduce((acc, k, idx) => setKey(acc, k, vals[idx]), {});
}

function createObject(fieldNames) {
    return (values) => zipObj(fieldNames, values);
}

function processData(data) {
    return data.values.map(createObject(data.fields));
}

function insertDataIn(model) {
    return (records) => model.bulkCreate(records);
}

function zip(xs, ys) {
    return xs.reduce((acc, x, i) => setKey(acc, i, [x, ys[i]]), []);
}

function mapPromisesInOrder(fn, vals) {
    if (vals.length === 0) return Promise.resolve();
    const [x, ...xs] = vals;
    return fn(x).then(() => mapPromisesInOrder(fn, [...xs]));
}

function groupBy(keyFn, vals) {
    return vals.reduce((acc, v) => {
        const key = keyFn(v);
        return key in acc
            ? setKey(acc, key, [...acc[key], v])
            : setKey(acc, key, [v]);
    }, {});
}

function entries(obj) {
    return Object.keys(obj).reduce((acc, k) => acc.concat([[k, obj[k]]]), []);
}

function addTutorCourses(Tutor) {
    return (values) => {
        const groupedByTutor = groupBy((x) => x.tutorId, values);
        const getCourseId = (x) => x.courseId;
        return Promise.all(
            entries(groupedByTutor).map(([tutorId, records]) =>
                Tutor.findOne({ where: { id: tutorId } }).then((tutor) =>
                    tutor.setCourses(records.map(getCourseId))
                )
            )
        );
    };
}

function seed() {
    const Course = mainStorage.db.models.course;
    const Location = mainStorage.db.models.location;
    const Tutor = mainStorage.db.models.tutor;

    const makeFileName = (body) => `./server/scripts/data/${body}.json`;
    const fileNamesPrimitives = ["locations", "courses", "tutors"].map(
        makeFileName
    );
    const modelsPrimitives = [Location, Course, Tutor];

    const processPair = ([fileName, model]) =>
        readJson(fileName)
            .then(processData)
            .then(insertDataIn(model));

    const insertPrimitives = () =>
        mapPromisesInOrder(
            processPair,
            zip(fileNamesPrimitives, modelsPrimitives)
        );

    const insertRelations = () => {
        const fileName = "./server/scripts/data/tutor_course.json";

        readJson(fileName)
            .then(processData)
            .then(addTutorCourses(Tutor));
    };

    insertPrimitives().then(insertRelations);
}

mainStorage.connect().then(seed);
