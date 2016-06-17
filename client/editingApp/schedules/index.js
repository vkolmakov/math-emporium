import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH, WEEKDAY_OPTIONS } from '../constants';

import { getLocations, setCurrentLocation } from '../locations/actions';
import { getTutors } from '../tutors/actions';
import { getSchedules, deleteSchedule, setCurrentWeekday } from './actions';

import LoadingSpinner from '../components/loadingSpinner';
import Table from '../components/table/index';
import CreateScheduleForm from './components/createScheduleForm';
import FilterControls from '../components/filterControls';

import { selectTransformOptions } from '../utils';

class EditSchedules extends Component {
    componentWillMount() {
        this.props.getTutors();
        this.props.getLocations();
        this.props.getSchedules();
    }

    render() {
        let { tutors, locations, schedules } = this.props;

        const { setCurrentLocation, deleteSchedule, setCurrentWeekday } = this.props;

        const weekdayOptions = selectTransformOptions('value', 'display')(WEEKDAY_OPTIONS);
        const locationsOptions = selectTransformOptions()(locations.all);

        if (!schedules.all) {
            return (
                <LoadingSpinner />
            );
        }


        if (locations.selected || schedules.selectedWeekday) {
            let predicate;
            if (locations.selected && schedules.selectedWeekday) {
                predicate = elem => elem.location.id == locations.selected.id && elem.weekday == schedules.selectedWeekday;
            } else if (schedules.selectedWeekday) {
                predicate = elem => elem.weekday == schedules.selectedWeekday;
            } else if (locations.selected) {
                predicate = elem => elem.location.id == locations.selected.id;
            }

            const [filteredTutors, filteredSchedules] = [tutors.all, schedules.all].map(
                list => list.filter(
                    predicate
                )
            );

            tutors = {
                ...tutors,
                all: filteredTutors,
            };

            schedules = {
                ...schedules,
                all: filteredSchedules,
            };
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
                action: `/${BASE_PATH}/schedules`,
            },
        ];

        return (
            <div className="content">
              <FilterControls options={locationsOptions}
                              currentValue={locations.selected ? locations.selected.id : ''}
                              onChange={setCurrentLocation.bind(this)}
                              placeholder={'Filter by location...'}/>
              <FilterControls options={weekdayOptions}
                              currentValue={schedules.selectedWeekday || ''}
                              onChange={setCurrentWeekday}
                              placeholder={'Filter by weekday...'}/>
              <CreateScheduleForm locations={locations}
                                  tutors={tutors} />
              <Table headers={tableHeaders}
                     data={schedules.all}
                     actions={tableActions} />
            </div>
        );
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
            selectedWeekday: state.schedules.selectedWeekday,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, setCurrentLocation, getTutors, getSchedules, deleteSchedule, setCurrentWeekday }
)(EditSchedules);
