import mongoose from "mongoose";
import { dateTime } from "../aux";

const ScheduledAppointmentDiagnostic = mongoose.model(
    "ScheduledAppointmentDiagnostic",
    mongoose.Schema(
        {
            actionName: String,
            appointmentId: { type: Number, index: true },
            timestamp: Date,
            calendarState: Object,
            derivedItems: Object,
            selectedTutor: Object,
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
            let result = null;
            if (persistedEntry) {
                /**
                 * Strip all of the mongoose-specific fields.
                 */
                result = {
                    actionName: persistedEntry.actionName,
                    appointmentId: persistedEntry.appointmentId,
                    timestamp: dateTime.toTimestamp(persistedEntry.timestamp),
                    calendarState: persistedEntry.calendarState,
                    derivedItems: persistedEntry.derivedItems,
                    selectedTutor: persistedEntry.selectedTutor,
                };
            }

            return result;
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
