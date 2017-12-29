import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';

import { getLocations, deleteLocation } from './actions';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
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
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        const tableHeaders = [
            {
                dataKey: 'name',
                label: 'Name',
            }, {
                dataKey: 'calendarId',
                label: 'Calendar ID',
            }, {
                dataKey: 'address',
                label: 'Address',
            }, {
                dataKey: 'phone',
                label: 'Phone',
            }, {
                dataKey: 'email',
                label: 'Email',
            }, {
                dataKey: 'description',
                label: 'Description',
            }, {
                dataKey: 'pictureLink',
                label: 'Link to a picture',
            },
        ];

        const tableActions = [
            {
                label: 'Remove',
                action: deleteLocation,
                requestConfirmation: true,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/locations`,
            },
        ];

        return (
            <div className="content">
              <div className="content-nav">
                <h2>Locations</h2>
              </div>
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
            error: state.locations.error,
        },
    };
}

export default connect(mapStateToProps, {
    getLocations,
    deleteLocation,
})(EditLocations);
