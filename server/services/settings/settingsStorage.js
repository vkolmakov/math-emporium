import mongoose from 'mongoose';

const DEFAULT_SETTINGS_ID = 'DEFAULT_SETTINGS_ID';

const Settings = mongoose.model('Settings', mongoose.Schema({
    id: String,
    values: Object,
}));

const SETTINGS_KEYS = {
    applicationTitle: 'applicationTitle',
    duplicateAllEmailsTo: 'duplicateAllEmailsTo',
};

function findOrCreateSettings(id) {
    const createDefaultSettings = () => {
        const s = new Settings;
        s.id = id;

        s.values = {
            [SETTINGS_KEYS.applicationTitle]: 'math-emporium',
            [SETTINGS_KEYS.duplicateAllEmailsTo]: '',
        };
        s.markModified('values');

        return s.save();
    };

    return Settings.findOne({ id })
        .then((result) => !!result ? Promise.resolve(result) : createDefaultSettings());
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

            return mongoose.connect(url, {
                user,
                pass: password,
            });
        };

        return connectToStorage()
            .then(() => findOrCreateSettings(DEFAULT_SETTINGS_ID));
    },

    updateDefaultSettings(values) {
        return findOrCreateSettings(DEFAULT_SETTINGS_ID)
            .then((settings) => {
                settings.values = {
                    ...settings.values,
                    ...values,
                };
                settings.markModified('values');
                return settings.save();
            });
    },

    getDefaultSettings() {
        return findOrCreateSettings(DEFAULT_SETTINGS_ID)
            .then((result) => result.values);
    },
};
