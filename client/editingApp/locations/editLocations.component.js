import React, { Component } from 'react';
import CreateLocationForm from './createLocationForm.component';
import DisplayList from '../displayList.component';

import { connect } from 'react-redux';

import { getLocations } from './actions';

class EditLocations extends Component {
    componentWillMount() {
        this.props.getLocations();
    }

    render() {
        const listConfig = {
            title: 'Locations',
            headers: ['Name', 'ID'],
            dataProps: ['name', 'id'],
            keyProp: 'id',
            apiLink: '/api/private/locations',
            webLink: '/edit-schedule/locations',
        };

        return (
            <div className="container">
              <CreateLocationForm />
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
