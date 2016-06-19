import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';

import { getLocations, deleteLocation } from './actions';

import LoadingSpinner from '../components/loadingSpinner';
import Table from '../components/table/index';
import CreateLocationForm from './components/createLocationForm';

class EditLocations extends Component {
    componentWillMount() {
        this.props.getLocations();
    }

    render() {
        const { locations } = this.props;

        const { deleteLocation } = this.props;

        if (!locations.all) {
            return (
                <LoadingSpinner />
            );
        }

        const tableHeaders = [
            {
                dataKey: 'name',
                label: 'Name',
            },
        ];

        const tableActions = [
            {
                label: 'Remove',
                action: deleteLocation,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/locations`,
            },
        ];

        return (
            <div className="content">

              <CreateLocationForm locations={locations} />

              <div className="list-wrap right-col">
                <Table headers={tableHeaders}
                     data={locations.all}
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
        },
    };
}

export default connect(mapStateToProps, {
    getLocations,
    deleteLocation,
})(EditLocations);
