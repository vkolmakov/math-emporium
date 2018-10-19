import mongoose from "mongoose";

const ScheduledAppointmentDiagnostic = mongoose.model(
    "ScheduledAppointmentDiagnostic",
    mongoose.Schema(
        {
            actionName: String,
            appointmentId: { type: Number, index: true },
            timestamp: Date,
            calendarState: Object,
            derivedItems: Object,
        },
        {
            /**
             * Since this data is only relevant for the latest appointments
             * as they appear, we don't need to store too many entries.
             */
            capped: { max: 200 },
        }
    )
);

export default class ScheduledAppointmentsDiagnosticsDataStorage {
    read(id) {
        return ScheduledAppointmentDiagnostic.findOne({
            appointmentId: id,
        }).then((persistedEntry) => {
            /**
             * Strip all of the mongoose-specific fields.
             */
            return {
                actionName: persistedEntry.actionName,
                appointmentId: persistedEntry.appointmentId,
                timestamp: persistedEntry.appointmentId,
                calendarState: persistedEntry.calendarState,
                derivedItems: persistedEntry.derivedItems,
            };
        });
    }

    write(id, data) {
        const entry = new ScheduledAppointmentDiagnostic({
            ...data,
            appointmentId: id,
        });
        return entry.save();
    }
}
