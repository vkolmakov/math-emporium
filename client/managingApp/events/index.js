import React, { Component } from 'react';
import { connect } from 'react-redux';

import { selectTransformOptions } from '../../editingApp/utils';
import { EVENT_TYPES_OPTIONS } from '../constants';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
import FilterControls from '../../components/filterControls';


class ManageEvents extends Component {
    constructor() {
        super();
        this.state = {
            selectedEventType: null,
        };
    }

    setSelectedEventType(eventTypeOption) {
        if (eventTypeOption) {
            const selectedEventType = EVENT_TYPES_OPTIONS.find(
                (g) => g.value === eventTypeOption.value);
            this.setState({ selectedEventType });
        } else {
            this.setState({ selectedEventType: null });
        }
    }

    render() {
        let { events } = this.props;

        if (!events.all) {
            return (
                <div className="content">
                    <LoadingSpinner/>
                </div>
            );
        }

        if (this.state.selectedEventType) {
            const { selectedEventType } = this.state;
            const filteredEvents = events.all.filter(
                e => e.type === selectedEventType.value);

            events = {
                ...events,
                all: filteredEvents,
            };
        }

        const eventTypeOptions = selectTransformOptions('value', 'display')(EVENT_TYPES_OPTIONS);

        const tableHeaders = [{
            dataKey: 'time',
            label: 'time',
        }, {
            dataKey: 'type',
            label: 'type',
            mapValuesToLabels: EVENT_TYPES_OPTIONS,
        }, {
            dataKey: 'user',
            label: 'user',
        }, {
            dataKey: 'data',
            label: 'data',
        }];

        const tableActions = [];

        return (
            <div className="content">
                <div className="content-nav">
                    <h2>Events</h2>
                    <FilterControls options={eventTypeOptions}
                                    currentValue={this.state.selectedEventType ? this.state.selectedEventType.value : null}
                                    onChange={this.setSelectedEventType.bind(this)}
                                    label="Filter by event type"
                                    placeholder="Select..." />
                </div>

                <div className="list-wrap">
                    <Table headers={tableHeaders}
                           data={events.all}
                           actions={tableActions} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        events: {
            all: state.managing.events.all,
        },
    };
}

export default connect(mapStateToProps)(ManageEvents);
