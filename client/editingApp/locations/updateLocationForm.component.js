import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateLocation, getLocations } from './actions';

import Form from '../components/form/index';

class UpdateLocationForm extends Component {
    componentDidMount() {
        const { name } = this.props.selectedLocation;

        this.props.dispatch(initialize('UpdateLocationForm', {
            name,
        }, ['name']));
    }

    render() {
        const { name } = this.props.fields;

        const onSubmit = (data) => {
            this.props.updateLocation(this.props.selectedLocation.id, data)
                .then(this.props.getLocations); // TODO: redirect back to the view instead
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update a Location';

        const fields = [
            {
                label: 'Name',
                input: {
                    type: 'text',
                    binding: name,
                },
            },
        ];

        return (
            <div className="list-wrap">
              <Form handleSubmit={handleSubmit}
                    title={title}
                    fields={fields} />
            </div>
        );
    }
}

function validate(values) {
    const errors = {};
    const requiredFields = {
        name: 'Enter a name',
    };

    Object.keys(requiredFields).forEach(field => {
        if (!values[field]) {
            errors[field] = requiredFields[field];
        }
    });

    return errors;
}

export default reduxForm({
    form: 'UpdateLocationForm',
    fields: ['name'],
    validate,
}, null, { updateLocation, getLocations })(UpdateLocationForm);
