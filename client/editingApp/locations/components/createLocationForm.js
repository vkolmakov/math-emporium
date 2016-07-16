import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createLocation, getLocations } from '../actions';

import { selectTransformOptions } from '../../utils';

import Form from '../../../components/form/index';

const FORM_FIELDS = ['name', 'calendarId'];

class CreateLocationForm extends Component {
    render() {
        const { name, calendarId } = this.props.fields;

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
            }, {
                label: 'Google Calendar ID',
                input: {
                    type: 'text',
                    binding: calendarId,
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
        calendarId: 'Enter a Google Calendar ID',
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
    fields: FORM_FIELDS,
    validate,
}, null, { createLocation, getLocations })(CreateLocationForm);
