import React, { Component } from "react";
import { connect } from "react-redux";

import LoadingSpinner from "../../components/loadingSpinner";
import Table from "../../components/table/index";

class ManageAppointments extends Component {
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

        const tableActions = [];

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
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        appointments: {
            all: state.managing.appointments.all,
        },
    };
}

export default connect(mapStateToProps)(ManageAppointments);
