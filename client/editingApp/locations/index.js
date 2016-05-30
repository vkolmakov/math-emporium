import React, { Component } from 'react';
import CreateLocationForm from './form.component'; // TODO: make a generic form
import DisplayList from '../displayList.component';

import { connect } from 'react-redux';

import { getLocations, createLocation } from './actions';

const listConfig = {
    title: 'Locations',
    headers: ['Name', 'ID'],
    dataProps: ['name', 'id'],
    keyProp: 'id',
    apiLink: '/api/private/locations',
    webLink: '/edit-schedule/locations',
};

const formConfig = {
    form: 'LocationForm',
    title: 'Add a New Location',
    fields: [
        { name: 'name', label: 'name', type: 'text', placeholder: 'Enter New Location Name' },
    ],
    onSubmitFunction: createLocation,
};

class EditLocations extends Component {
    componentWillMount() {
        this.props.getLocations();
    }

    render() {
        return (
            <div className="container">
              <CreateLocationForm
                 config={formConfig}
                 updateData={this.props.getLocations}/>

              <DisplayList
                 data={this.props.locations}
                 config={listConfig}
                 updateData={this.props.getLocations}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: state.locations.all,
    };
}

export default connect(mapStateToProps, { getLocations })(EditLocations);
