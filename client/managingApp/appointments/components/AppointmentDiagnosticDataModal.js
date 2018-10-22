import React from "react";
import Modal from "@client/components/Modal";

export default function AppointmentDiagnosticDataModal({
    diagnosticDataDescription,
    clearSelection,
}) {
    const { selectedEntry, error, shouldShowModal } = diagnosticDataDescription;

    let DiagnosticDataDisplay;
    if (error) {
        DiagnosticDataDisplay = () => (
            <pre>{JSON.stringify(error, null, 2)}</pre>
        );
    } else if (selectedEntry) {
        const calendarEventsDisplay = selectedEntry.calendarState.events
            .map((event) => event.summary)
            .join("\n");

        const derivedAppointmentsDisplay = selectedEntry.derivedItems.appointments
            .map(
                ({ course, tutor, student }) =>
                    `Tutor: ${tutor} | Student: ${student} | Course: ${course}`
            )
            .join("\n");

        const derivedScheduleDisplay = selectedEntry.derivedItems.scheduledTutors
            .map((tutor) => tutor.name)
            .join("\n");

        const availableTutors = selectedEntry.derivedItems.availableTutors
            .map((tutor) => tutor.name)
            .join("\n");

        const selectedTutor = selectedEntry.selectedTutor.name;

        DiagnosticDataDisplay = () => (
            <div>
                <div className="calendar-events">
                    <h2>Calendar Events</h2>
                    <pre>{calendarEventsDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Scheduled Appointments</h2>
                    <pre>{derivedAppointmentsDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Scheduled Tutors</h2>
                    <pre>{derivedScheduleDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Available Tutors</h2>
                    <pre>{availableTutors || "None"}</pre>
                </div>

                <div>
                    <h2>Selected Tutor</h2>
                    <pre>{selectedTutor || "None"}</pre>
                </div>

                <div className="raw-data">
                    <h2>Raw Data Entry</h2>
                    <pre>{JSON.stringify(selectedEntry, null, 2)}</pre>
                </div>
            </div>
        );
    } else {
        /**
         * This case will happen on the initial load, however here we don't
         * care about the modal contents since the modal is not displayed.
         */
        DiagnosticDataDisplay = () => <span />;
    }

    return (
        <Modal
            isOpen={shouldShowModal}
            onRequestClose={clearSelection}
            className="appointment-diagnostic-data-modal">
            <DiagnosticDataDisplay />
        </Modal>
    );
}
