
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createCourse } from './actions';
import { getLocations, setCurrentLocation } from '../locations/actions';


class CreateForm extends Component {
    componentWillMount() {
        // TODO: Possible bottleneck
        this.props.getLocations();
    }

    render() {
        const handleSubmit = this.props.handleSubmit;
        const { title, fields } = this.props.config;

        this.props.config.onSubmitFunction = this.props.createCourse;

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
        let inputElement;
        if (field.type === 'text') {
            inputElement = <input type="text" placeholder={field.placeholder} {...fieldBinding}/>;
        } else if (field.type === 'select') {
            const options = this.props[field.propsOptionsKey];
            inputElement = (
                <select className="select" {...fieldBinding}>
                  {options.map((elem) => {
                      let key = elem[field.optionValueKey];
                      let displayValue = elem[field.optionDisplayKey];
                      return (
                          <option
                             key={key}
                             value={key}>
                            {displayValue}
                          </option>
                      );
                  })}
                </select>);
        }

        return (
            <div className="form-field" key={field.name}>
              <label>{field.label}</label>
              <div className="form-input-group">
                {inputElement}
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

function mapStateToProps(state) {
    return {
        locations: state.locations.all,
        curentLocation: state.locations.location,
    };
}

export default reduxForm({
    form: 'CoursesForm',
    fields: ['name', 'code', 'location', 'color'],
    validate,
}, mapStateToProps, { createCourse, getLocations, setCurrentLocation })(CreateForm);
