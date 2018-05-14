import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createLocation, getLocations } from '../actions';

import Form from '../../../components/form/index';

const FORM_FIELDS = [
    'name',
    'calendarId',
    'address',
    'phone',
    'email',
    'description',
    'pictureLink',
    'maximumAppointmentsPerLocation',
    'maximumAppointmentsPerSubject',
    'maximumAppointmentsPerCourse',
];

class CreateLocationForm extends Component {
    render() {
        const {
            name,
            calendarId,
            address,
            phone,
            email,
            description,
            pictureLink,
            maximumAppointmentsPerLocation,
            maximumAppointmentsPerSubject,
            maximumAppointmentsPerCourse,
        } = this.props.fields;

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
                input: { type: 'textarea', binding: description },
            }, {
                label: 'Link to a picture',
                input: { type: 'text', binding: pictureLink },
            }, {
                label: 'Maximum number of appointments per location',
                input: { type: 'text', binding: maximumAppointmentsPerLocation },
            }, {
                label: 'Maximum number of appointments per subject',
                input: { type: 'text', binding: maximumAppointmentsPerSubject },
            }, {
                label: 'Maximum number of appointments per course',
                input: { type: 'text', binding: maximumAppointmentsPerCourse },
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
    const ensureNumber = (compare) => (numberString) => {
        const number = parseInt(numberString, 10);
        return !isNaN(number) && compare(number);
    };

    const ensureNonEmpty = (str) => !!str;

    const validators = {
        maximumAppointmentsPerLocation: { checkIfValid: ensureNumber((n) => n >= 1), error: 'Enter a positive integer' },
        maximumAppointmentsPerSubject: { checkIfValid: ensureNumber((n) => n >= 1), error: 'Enter a positive integer' },
        maximumAppointmentsPerCourse: { checkIfValid: ensureNumber((n) => n >= 1), error: 'Enter a positive integer' },
        name: { checkIfValid: ensureNonEmpty, error: 'Enter a name' },
        calendarId: { checkIfValid: ensureNonEmpty, error: 'Enter a Google Calendar ID' },
    };

    const errors = Object.keys(validators).reduce((acc, fieldName) => {
        const { checkIfValid, error } = validators[fieldName];
        if (!checkIfValid(values[fieldName])) {
            acc[fieldName] = error;
        }
        return acc;
    }, {});

    return errors;
}

export default reduxForm({
    form: 'CreateLocationForm',
    fields: FORM_FIELDS,
    validate,
}, null, { createLocation, getLocations })(CreateLocationForm);
