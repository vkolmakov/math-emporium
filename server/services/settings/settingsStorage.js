import mongoose from "mongoose";

const DEFAULT_SETTINGS_ID = "DEFAULT_SETTINGS_ID";

const Settings = mongoose.model(
    "Settings",
    mongoose.Schema({
        id: String,
        values: Object,
    })
);

const SETTINGS_KEYS = {
    applicationTitle: "applicationTitle",
    duplicateAllEmailsTo: "duplicateAllEmailsTo",
    applicationMainHomePictureLink: "applicationMainHomePictureLink",

    faqText: "faqText",
    faqContent: "faqContent",

    announcementText: "announcementText",
    announcementContent: "announcementContent",
    announcementBackgroundColor: "announcementBackgroundColor",
    announcementTextColor: "announcementTextColor",

    maximumAppointmentsPerUser: "maximumAppointmentsPerUser",
};

const DEFAULT_SETTINGS_VALUES = {
    [SETTINGS_KEYS.applicationTitle]: "math-emporium",
    [SETTINGS_KEYS.duplicateAllEmailsTo]: "",
    [SETTINGS_KEYS.applicationMainHomePictureLink]: "",

    [SETTINGS_KEYS.faqText]: "",
    [SETTINGS_KEYS.faqContent]: "",

    [SETTINGS_KEYS.announcementText]: "",
    [SETTINGS_KEYS.announcementContent]: "",
    [SETTINGS_KEYS.announcementBackgroundColor]: "#D9EDF9",
    [SETTINGS_KEYS.announcementTextColor]: "#111111",

    [SETTINGS_KEYS.maximumAppointmentsPerUser]: 5,
};

function findOrCreateSettings(id) {
    const createDefaultSettings = () => {
        const s = new Settings();
        s.id = id;

        s.values = DEFAULT_SETTINGS_VALUES;
        s.markModified("values");

        return s.save();
    };

    return Settings.findOne({ id }).then(
        (result) => (result ? Promise.resolve(result) : createDefaultSettings())
    );
}

function ensureAllSettingsFieldsAreCreated(id) {
    return Settings.findOne({ id }).then((result) => {
        const existingValues = result.values;

        result.values = {
            ...DEFAULT_SETTINGS_VALUES,
            ...existingValues,
        };
        result.markModified("values");

        return result.save();
    });
}

export default {
    keys: SETTINGS_KEYS,

    connect(url, options) {
        const { user, password } = options;

        mongoose.Promise = global.Promise;

        const connectToStorage = () => {
            if (mongoose.connection.readyState === 1) {
                return Promise.resolve();
            }

            return mongoose.connect(
                url,
                {
                    user,
                    pass: password,
                }
            );
        };

        return connectToStorage()
            .then(() => findOrCreateSettings(DEFAULT_SETTINGS_ID))
            .then(() => ensureAllSettingsFieldsAreCreated(DEFAULT_SETTINGS_ID));
    },

    updateDefaultSettings(values) {
        return findOrCreateSettings(DEFAULT_SETTINGS_ID).then((settings) => {
            settings.values = values;
            settings.markModified("values");
            return settings.save();
        });
    },

    getDefaultSettings() {
        return findOrCreateSettings(DEFAULT_SETTINGS_ID).then(
            (result) => result.values
        );
    },
};
