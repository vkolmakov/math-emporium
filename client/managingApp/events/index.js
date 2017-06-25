import React, { Component } from 'react';
import { connect } from 'react-redux';

import { selectTransformOptions } from '../../editingApp/utils';
import { getEvents } from './actions';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
import FilterControls from '../../components/filterControls';

const EVENT_TYPES = {
    'create appointment': 1,
    'remove appointment': 2,
    'sign in': 3,
};

const EVENT_TYPES_OPTIONS =
      Object.keys(EVENT_TYPES).map(
          display => ({ value: EVENT_TYPES[display], display }));

class ManageEvents extends Component {
    constructor() {
        super();
        this.state = {
            selectedEventType: null,
        };
    }

    componentWillMount() {
        this.props.getEvents();
    }

    setSelectedEventType(eventTypeOption) {
        console.log('setting to', eventTypeOption);
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
                u => u.group === selectedEventType.value);

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
                                    placeholder={'Filter by event type...'} />
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

export default connect(mapStateToProps, {
    getEvents,
})(ManageEvents);
