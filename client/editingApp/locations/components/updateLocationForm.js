import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateLocation, getLocations } from '../actions';

import Form from '../../components/form/index';

class UpdateLocationForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { name } = this.props.selectedLocation;

        this.props.dispatch(initialize('UpdateLocationForm', {
            name,
        }, ['name']));
    }

    render() {
        const { name } = this.props.fields;

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props.updateLocation(this.props.selectedLocation.id, data)
                .then(result => {
                    if (!result.error) {
                        this.setState({ success: true });
                    }
                    return new Promise(resolve => resolve(null));
                })
                .then(this.props.getLocations);
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

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.locations.error,
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
    fields: ['name'],
    validate,
}, null, { updateLocation, getLocations })(UpdateLocationForm);
