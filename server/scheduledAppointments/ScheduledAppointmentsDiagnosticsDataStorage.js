export default class ScheduledAppointmentsDiagnosticsDataStorage {
    read(id) {
        return Promise.resolve();
    }

    write(id, data) {
        console.log("writing", { id, data });
        return Promise.resolve();
    }
}
