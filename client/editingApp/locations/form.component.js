import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createLocation } from './actions';

class CreateForm extends Component {
    render() {
        this.props.config.onSubmitFunction = this.props.createLocation;

        const handleSubmit = this.props.handleSubmit;
        const { title, fields } = this.props.config;

        return (
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
              <label className="form-header">{title}</label>

              {fields.map((field) => this.createFormField(field))}

              <div className="form-field">
                <button type="submit" className="button">Create</button>
              </div>
            </form>
        );
    }

    createFormField(field) {
        const fieldBinding = this.props.fields[field.name];
        // TODO: Handle selects
        return (
            <div className="form-field" key={field.name}>
              <label>{field.label}</label>
              <div className="form-input-group">
                <input type="text" placeholder={field.placeholder} {...fieldBinding}/>
                <span className="form-help">{fieldBinding.touched ? fieldBinding.error : ''}</span>
              </div>
            </div>
        );
    }

    onSubmit(data) {
        this.props.config.onSubmitFunction(data)
            .then(this.props.updateData)
            .then(this.props.resetForm);
    }
}

function validate(values) {
    const errors = {};

    if (!values.name) {
        errors.name = 'Enter location name';
    }

    return errors;
}

export default reduxForm({
    form: 'LocationForm',
    fields: ['name'],
    validate,
}, null, { createLocation })(CreateForm);
