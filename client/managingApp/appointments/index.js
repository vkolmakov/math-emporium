import React, { Component } from "react";
import { connect } from "react-redux";

import {
    getAppointmentDiagnosticData,
    clearAppointmentDiagnosticData,
} from "./actions";

import LoadingSpinner from "@client/components/loadingSpinner";
import Table from "@client/components/table/index";
import Modal from "@client/components/Modal";

const DiagnosticDataModal = ({ diagnosticDataDescription, clearSelection }) => {
    const diagnosticDataRepresentation =
        diagnosticDataDescription.selectedEntry === null
            ? "Diagnostic entry was not found."
            : JSON.stringify(diagnosticDataDescription.selectedEntry, null, 2);

    return (
        <Modal
            isOpen={diagnosticDataDescription.shouldShowModal}
            onRequestClose={clearSelection}>
            <pre>{diagnosticDataRepresentation}</pre>
        </Modal>
    );
};

class ManageAppointments extends Component {
    showDiagnosticData(appointmentId) {
        return this.props.getAppointmentDiagnosticData(appointmentId);
    }

    render() {
        const { appointments } = this.props;

        if (!appointments.all) {
            return (
                <div className="content">
                    <LoadingSpinner />
                </div>
            );
        }

        const tableHeaders = [
            {
                dataKey: "location",
                label: "location",
            },
            {
                dataKey: "course",
                label: "course",
            },
            {
                dataKey: "user",
                label: "user",
            },
            {
                dataKey: "time",
                label: "time",
            },
        ];

        const tableActions = [
            {
                label: "Diagnosic Data",
                action: this.showDiagnosticData.bind(this),
            },
        ];

        return (
            <div className="content">
                <div className="content-nav">
                    <h2>Active Appointments</h2>
                </div>

                <div className="list-wrap">
                    <Table
                        headers={tableHeaders}
                        data={appointments.all}
                        actions={tableActions}
                    />
                </div>
                <DiagnosticDataModal
                    diagnosticDataDescription={
                        this.props.diagnosticDataDescription
                    }
                    clearSelection={this.props.clearAppointmentDiagnosticData.bind(
                        this
                    )}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        appointments: {
            all: state.managing.appointments.all,
        },
        diagnosticDataDescription:
            state.managing.appointments.diagnosticDataDescription,
    };
}

export default connect(
    mapStateToProps,
    { getAppointmentDiagnosticData, clearAppointmentDiagnosticData }
)(ManageAppointments);
