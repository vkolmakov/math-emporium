import mongoose from "mongoose";

const Event = mongoose.model(
    "Event",
    mongoose.Schema(
        {
            type: Number,
            user: { id: Number, email: String },
            data: mongoose.Schema.Types.Mixed,
        },
        {
            timestamps: true,
        }
    )
);

function saveEvent(event) {
    const e = new Event(event);
    return e.save();
}

export function connectToEventStorage(url, options) {
    const { user, password } = options;

    mongoose.Promise = global.Promise;
    return mongoose.connect(
        url,
        {
            user,
            pass: password,
        }
    );
}

export default {
    save(event) {
        return saveEvent(event);
    },
    getAll() {
        return Event.find({});
    },
    getLatest(count) {
        return Event.find({}, null, { limit: count, sort: { createdAt: -1 } });
    },
};
