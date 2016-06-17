import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';

import LoadingSpinner from '../../components/loadingSpinner';
import UpdateLocationForm from './updateLocationForm';

class LocationDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
    }

    render() {
        const { locations } = this.props;

        const id = this.props.params.id;

        const selectedLocation = locations.all.find(
            location => location.id == id
        );

        if (!selectedLocation) {
            return <LoadingSpinner />;
        }

        return (
            <div className="content">
              <UpdateLocationForm selectedLocation={selectedLocation} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations },
)(LocationDetail);
