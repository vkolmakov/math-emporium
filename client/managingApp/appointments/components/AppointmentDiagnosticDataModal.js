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
        /**
         * Calendar events.
         */
        const calendarSummaries = selectedEntry.calendarState.events.map(
            (event) => event.summary
        );
        const maxSummaryLength = Math.max(
            ...calendarSummaries.map((summary) => summary.length)
        );
        const calendarEventsDisplay = calendarSummaries
            .map(
                (summary) => "| " + summary.padEnd(maxSummaryLength, " ") + " |"
            )
            .join("\n");

        /**
         * Appointments.
         */
        const derivedAppointmentsDisplay = selectedEntry.derivedItems.appointments
            .map(
                ({ course, tutor, student }) =>
                    `T: ${tutor} | S: ${student} | C: ${course}`
            )
            .join("\n");

        /**
         * Schedule.
         */
        const derivedScheduleDisplay = selectedEntry.derivedItems.scheduledTutors
            .map((tutor) => tutor.name)
            .join("\n");

        /**
         * Available tutors.
         */
        const resultantAvailableTutors = selectedEntry.derivedItems.availableTutors
            .map((tutor) => tutor.name)
            .join("\n");
        DiagnosticDataDisplay = () => (
            <div>
                <div className="calendar-events">
                    <h2>Present Calendar Events</h2>
                    <pre>{calendarEventsDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Derived Appointments</h2>
                    <pre>{derivedAppointmentsDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Derived Schedule</h2>
                    <pre>{derivedScheduleDisplay || "None"}</pre>
                </div>

                <div>
                    <h2>Resultant Available Tutors</h2>
                    <pre>{resultantAvailableTutors || "None"}</pre>
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
        <Modal isOpen={shouldShowModal} onRequestClose={clearSelection}>
            <DiagnosticDataDisplay />
        </Modal>
    );
}
