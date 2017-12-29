import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createLocation, getLocations } from '../actions';

import { selectTransformOptions } from '../../utils';

import Form from '../../../components/form/index';

const FORM_FIELDS = ['name', 'calendarId', 'address', 'phone', 'email', 'description', 'pictureLink'];

class CreateLocationForm extends Component {
    render() {
        const { name, calendarId, address, phone, email, description, pictureLink } = this.props.fields;

        const onSubmit = (data) => {
            this.props.createLocation(data)
                .then(result => {
                    if (result.error) {
                        return Promise.resolve();
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
                input: { type: 'text', binding: name },
            }, {
                label: 'Google Calendar ID',
                input: { type: 'text', binding: calendarId },
            }, {
                label: 'Address',
                input: { type: 'text', binding: address },
            }, {
                label: 'Phone',
                input: { type: 'text', binding: phone },
            }, {
                label: 'Email',
                input: { type: 'text', binding: email },
            }, {
                label: 'Description',
                input: { type: 'text', binding: description },
            }, {
                label: 'Link to a picture',
                input: { type: 'text', binding: pictureLink },
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
