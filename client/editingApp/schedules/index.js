import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH, WEEKDAY_OPTIONS, TIME_OPTIONS } from '../constants';

import { getLocations, setCurrentLocation } from '../locations/actions';
import { getTutors } from '../tutors/actions';
import { getSchedules, deleteSchedule, setCurrentWeekday } from './actions';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
import CreateScheduleForm from './components/createScheduleForm';
import FilterControls from '../../components/filterControls';

import { selectTransformOptions } from '../utils';

import { DERIVE_SCHEDULES_FROM_CALENDAR } from '../../constants';

class EditSchedules extends Component {
    componentWillMount() {
        this.props.getTutors();
        this.props.getLocations();
        this.props.getSchedules();
    }

    render() {
        if (DERIVE_SCHEDULES_FROM_CALENDAR) {
            return (
                <div className="content">
                    <div className="middle-help-message-wrap">
                        <h1>Schedules are derived directly from Google Calendar on this instance.</h1>
                    </div>
                </div>
            );
        }


        let { tutors, locations, schedules } = this.props;

        const { setCurrentLocation, deleteSchedule, setCurrentWeekday } = this.props;

        const weekdayOptions = selectTransformOptions('value', 'display')(WEEKDAY_OPTIONS);
        const locationsOptions = selectTransformOptions()(locations.all);

        if (!schedules.all || !locations.all || !tutors.all) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        if (locations.selected || schedules.selectedWeekday) {
            let filteringFn;
            if (locations.selected && schedules.selectedWeekday) {
                filteringFn = elem => {
                    if (elem.weekday) {
                        // this is a schedule, filter by both weekday and location
                        return elem.location && elem.location.id == locations.selected.id && elem.weekday == schedules.selectedWeekday
                    } else {
                        // this is a tutor, filter by just location
                        return elem.location && elem.location.id == locations.selected.id;
                    }
                };
            } else if (schedules.selectedWeekday) {
                filteringFn = elem => elem.weekday == schedules.selectedWeekday;
            } else if (locations.selected) {
                filteringFn = elem => elem.location && elem.location.id == locations.selected.id;
            }

            const [filteredTutors, filteredSchedules] = [tutors.all, schedules.all].map(
                list => list.filter(
                    filteringFn
                )
            );

            tutors = {
                ...tutors,
                all: filteredTutors,
            };

            const sortSchedulesFn = (s1, s2) => (
                // compare by just the hour value
                s1.time - s2.time
            );

            schedules = {
                ...schedules,
                all: filteredSchedules.sort(sortSchedulesFn),
            };
        }

        const tableHeaders = [
            {
                dataKey: 'weekday',
                mapValuesToLabels: (val) => WEEKDAY_OPTIONS.find(({ value }) => value === val).display,
                label: 'Weekday',
            }, {
                dataKey: 'time',
                mapValuesToLabels: (val) => TIME_OPTIONS.find(({ value }) => value === val).display,
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
                requestConfirmation: true,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/schedules`,
            },
        ];

        return (
            <div className="content">
              <div className="content-nav">
                <h2>Schedules</h2>
                <FilterControls options={locationsOptions}
                                currentValue={locations.selected ? locations.selected.id : ''}
                                onChange={setCurrentLocation.bind(this)}
                                label="Filter by location"
                                placeholder="Select..." />

                <FilterControls options={weekdayOptions}
                                currentValue={schedules.selectedWeekday || ''}
                                onChange={setCurrentWeekday}
                                label="Filter by weekday"
                                placeholder="Select..." />
              </div>

              <CreateScheduleForm locations={locations}
                                  tutors={tutors}
                                  schedules={schedules} />

              <div className="list-wrap right-col">
                <Table headers={tableHeaders}
                     data={schedules.all}
                     actions={tableActions} />
              </div>

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
            error: state.schedules.error,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, setCurrentLocation, getTutors, getSchedules, deleteSchedule, setCurrentWeekday }
)(EditSchedules);
