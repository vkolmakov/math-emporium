import mongoose from "mongoose";

const ScheduledAppointmentDiagnostic = mongoose.model(
    "ScheduledAppointmentDiagnostic",
    mongoose.Schema({
        actionName: String,
        appointmentId: { type: Number, index: true },
        timestamp: Date,
        calendarState: Object,
        derivedItems: Object,
    })
);

export default class ScheduledAppointmentsDiagnosticsDataStorage {
    read(id) {
        return ScheduledAppointmentDiagnostic.findOne({ appointmentId: id });
    }

    write(id, data) {
        const entry = new ScheduledAppointmentDiagnostic({
            ...data,
            appointmentId: id,
        });
        return entry.save();
    }
}
