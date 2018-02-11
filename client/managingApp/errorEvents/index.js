import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';


class ManageErrorEvents extends Component {
    constructor() {
        super();
        this.state = {
            selectedEventType: null,
        };
    }

    render() {
        const { errorEvents } = this.props;

        if (!errorEvents.all) {
            return (
                <div className="content">
                    <LoadingSpinner/>
                </div>
            );
        }

        const tableHeaders = [{
            dataKey: 'time',
            label: 'time',
        }, {
            dataKey: 'type',
            label: 'type',
        }, {
            dataKey: 'user',
            label: 'user',
        }, {
            dataKey: 'data',
            label: 'data',
        }, {
            dataKey: 'stacktrace',
            label: 'stacktrace',
        }];

        const tableActions = [];

        return (
            <div className="content">
                <div className="content-nav">
                  <h2>Error Events</h2>
                </div>

                <div className="list-wrap">
                    <Table headers={tableHeaders}
                           data={errorEvents.all}
                           actions={tableActions} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        errorEvents: {
            all: state.managing.errorEvents.all,
        },
    };
}

export default connect(mapStateToProps)(ManageErrorEvents);
