import mongoose from 'mongoose';


const ErrorEvent = mongoose.model('ErrorEvent', mongoose.Schema({
    type: Number,
    user: { id: Number, email: String },
    stacktrace: String,
    data: mongoose.Schema.Types.Mixed,
}, {
    capped: { size: 65536, max: 100 },
    timestamps: true,
}));

function saveErrorEvent(errorEvent) {
    const e = new ErrorEvent(errorEvent);
    return e.save();
}

export default {
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

        return connectToStorage();
    },

    save(errorEvent) {
        return saveErrorEvent(errorEvent);
    },
    getAll() {
        return ErrorEvent.find({});
    },
};
