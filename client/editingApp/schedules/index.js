import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';

import { getLocations, setCurrentLocation } from '../locations/actions';
import { getTutors } from '../tutors/actions';
import { getSchedules, deleteSchedule } from './actions';

import LoadingSpinner from '../components/loadingSpinner';
import Table from '../components/table/index';
import CreateScheduleForm from './components/createScheduleForm';
import FilterControls from '../components/filterControls';

class EditSchedules extends Component {
    componentWillMount() {
        this.props.getTutors();
        this.props.getLocations();
        this.props.getSchedules();
    }

    render() {
        let { tutors, locations, schedules } = this.props;

        const { setCurrentLocation, deleteSchedule } = this.props;

        if (!schedules.all) {
            return (
                <LoadingSpinner />
            );
        }

        const tableHeaders = [
            {
                dataKey: 'id',
                label: 'ID',
            }, {
                dataKey: 'weekday',
                label: 'Weekday',
            }, {
                dataKey: 'time',
                label: 'Time',
            }, {
                dataKey: 'location->name',
                label: 'Location',
            }, {
                dataKey: 'tutors->name',
                label: 'Tutors',
            },
        ];

        const tableActions = [
            {
                label: 'Remove',
                action: deleteSchedule,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/tutors`,
            },
        ]

        return (
            <div className="content">
              <FilterControls options={locations.all}
                              currentValue={locations.selected ? locations.selected.id : ''}
                              onChange={setCurrentLocation.bind(this)} />
              <CreateScheduleForm locations={locations}
                                  tutors={tutors} />
              <Table headers={tableHeaders}
                     data={schedules.all}
                     actions={tableActions} />
            </div>
        )

    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
        tutors: {
            all: state.tutors.all,
        },
        schedules: {
            all: state.schedules.all,
        }
    };
}

export default connect(
    mapStateToProps,
    { getLocations, setCurrentLocation, getTutors, getSchedules, deleteSchedule }
)(EditSchedules);
