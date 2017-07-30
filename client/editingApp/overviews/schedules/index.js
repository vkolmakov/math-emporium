import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSchedules } from '../../schedules/actions';
import { getLocations, setCurrentLocation } from '../../locations/actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import FilterControls from '../../../components/filterControls';

import Weekday from './components/weekday';

import { selectTransformOptions } from '../../utils';


class SchedulesOverview extends Component {
    componentWillMount() {
        this.props.getSchedules();
        this.props.getLocations();
    }

    render() {
        const { schedules, locations } = this.props;
        const { setCurrentLocation } = this.props;

        if (!schedules || !locations) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        if (!locations.selected) {
            return (
                <div className="content">
                  <FilterControls options={locationsOptions}
                                  currentValue={locations.selected ? locations.selected.id : null}
                                  onChange={setCurrentLocation}
                                  label="Select a location"
                                  placeholder="Select..." />
                  <div className="middle-help-message-wrap">
                    <h1>Select a location...</h1>
                  </div>
                </div>
            );
        }

        const filteredSchedules = schedules.all.filter(
            schedule => schedule.location.id == locations.selected.id
        );

        const groupedSchedules = filteredSchedules.reduce(
            (groups, schedule) => {
                let weekday = schedule.weekday;
                groups[weekday] = groups[weekday] ? [...groups[weekday], schedule] : [schedule];
                return groups;
            }, {});


        return (
            <div className="content">
              <div className="content-nav">
                <FilterControls options={locationsOptions}
                                currentValue={locations.selected ? locations.selected.id : null}
                                onChange={setCurrentLocation}
                                placeholder={'Select a location...'} />
                <h2>Schedule for {locations.selected.name}</h2>
              </div>
              <div className="row">
                {Object.keys(groupedSchedules).map(
                  weekday => (
                      <div className="weekday-wrap" key={weekday}>
                        <Weekday weekday={weekday}
                                 schedule={groupedSchedules[weekday]} />
                      </div>
                  )
              )}
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        schedules: {
            all: state.schedules.all,
        },
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
    };
}

export default connect(
    mapStateToProps,
    { getSchedules, getLocations, setCurrentLocation },
)(SchedulesOverview);
