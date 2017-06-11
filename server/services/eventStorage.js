import mongoose from 'mongoose';


const Event = mongoose.model('Event', mongoose.Schema({
    type: Number,
    user: { id: Number, email: String },
    data: mongoose.Schema.Types.Mixed,
}, {
    timestamps: true,
}));

function saveEvent(event) {
    const e = new Event(event);
    return e.save();
}

export function connectToEventStorage(url, options) {
    mongoose.Promise = global.Promise;
    return mongoose.connect(url, options);
}

export default {
    save(event) {
        return saveEvent(event);
    },
};
