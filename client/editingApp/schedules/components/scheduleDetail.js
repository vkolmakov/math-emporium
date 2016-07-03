import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations, setCurrentLocation } from '../../locations/actions';
import { getTutors } from '../../tutors/actions';
import { getSchedules } from '../actions';

import LoadingSpinner from '../../components/loadingSpinner';
import UpdateScheduleForm from './updateScheduleForm';

class ScheduleDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getTutors();
        this.props.getSchedules();
    }

    render() {
        let { locations, tutors, schedules } = this.props;

        const { id } = this.props.params;

        const selectedSchedule = schedules.all.find(
            schedule => schedule.id == id
        );

        if (!selectedSchedule) {
            return (
                <LoadingSpinner />
            );
        }

        if (locations.selected) {
            const selectedLocation = locations.selected;
            const [filteredTutors] = [tutors.all].map(
                list => list.filter(
                    elem => elem.location.id == selectedLocation.id
                )
            );

            tutors = {
                ...tutors,
                all: filteredTutors,
            };
        }

        return (
            <div className="content">
              <UpdateScheduleForm locations={locations}
                                  tutors={tutors}
                                  schedules={schedules}
                                  selectedSchedule={selectedSchedule} />
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
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, setCurrentLocation, getTutors, getSchedules }
)(ScheduleDetail);