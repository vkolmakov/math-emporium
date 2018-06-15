import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import UpdateLocationForm from './updateLocationForm';

class LocationDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
    }

    render() {
        const { locations } = this.props;

        const id = this.props.match.params.id;

        const selectedLocation = locations.all.find(
            location => location.id == id
        );

        if (!selectedLocation) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="content">
              <UpdateLocationForm selectedLocation={selectedLocation}
                                  locations={locations} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
            error: state.locations.error,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations },
)(LocationDetail);
