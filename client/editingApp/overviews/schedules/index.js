import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSchedules } from '../../schedules/actions';
import { getLocations, setCurrentLocation } from '../../locations/actions';

import LoadingSpinner from '../../components/loadingSpinner';
import FilterControls from '../../components/filterControls';

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
                <LoadingSpinner />
            );
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        if (!locations.selected) {
            // TODO: add a class
            return (
                <div>
                  Select a location...
                  <FilterControls options={locationsOptions}
                                  currentValue={locations.selected ? locations.selected.id : null}
                                  onChange={setCurrentLocation}
                                  placeholder={'Select a location'} />
                </div>
            );
        }

        return (
            <div>
              Bello at {locations.selected.name}!
              <FilterControls options={locationsOptions}
                                  currentValue={locations.selected ? locations.selected.id : null}
                                  onChange={setCurrentLocation}
                                  placeholder={'Select a location'} />
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
