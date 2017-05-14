import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateLocation, getLocations } from '../actions';
import { ROUTES } from '../../constants';
import { redirectTo, id } from '../../../utils';

import Form from '../../../components/form/index';

const FORM_FIELDS = ['name', 'calendarId'];

class UpdateLocationForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { name, calendarId } = this.props.selectedLocation;

        this.props.dispatch(initialize('UpdateLocationForm', {
            name,
            calendarId,
        }, FORM_FIELDS));
    }

    render() {
        const { name, calendarId } = this.props.fields;

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props.updateLocation(this.props.selectedLocation.id, data)
                .then(result => redirectTo(ROUTES.LOCATIONS),
                      id);
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
            }, {
                label: 'Calendar ID',
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
            success: this.state.success,
        };

        return (
            <div className="list-wrap">
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
    form: 'UpdateLocationForm',
    fields: FORM_FIELDS,
    validate,
}, null, { updateLocation, getLocations })(UpdateLocationForm);
