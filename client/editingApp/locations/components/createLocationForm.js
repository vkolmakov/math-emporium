import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createLocation, getLocations } from '../actions';

import { selectTransformOptions } from '../../utils';

import Form from '../../components/form/index';

class CreateLocationForm extends Component {
    render() {
        const { name } = this.props.fields;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);

        const onSubmit = (data) => {
            this.props.createLocation(data)
                .then(result => {
                    if (result.error) {
                        return new Promise(resolve => resolve(null));
                    }
                    return this.props.resetForm;
                })
                .then(this.props.getLocations);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Add a New Location';

        const fields = [
            {
                label: 'Name',
                input: {
                    type: 'text',
                    binding: name,
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.locations.error,
        };

        return (
            <div className="form-wrap">
              <Form {...formConfig} />
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
    form: 'CreateLocationForm',
    fields: ['name'],
    validate,
}, null, { createLocation, getLocations })(CreateLocationForm);
