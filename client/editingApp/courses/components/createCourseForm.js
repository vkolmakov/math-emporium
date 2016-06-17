import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createCourse, getCourses } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { GOOGLE_CALENDAR_COLORS } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../components/form/index';

class CreateCourseForm extends Component {
    render() {
        const { name, location, code, color } = this.props.fields;

        const { setCurrentLocation } = this.props;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const colorsOptions = selectTransformOptions('value', 'name', 'color')(GOOGLE_CALENDAR_COLORS);

        const onSubmit = (data) => {
            this.props.createCourse(data)
                .then(this.props.resetForm)
                .then(this.props.getCourses);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Add a New Course';

        const fields = [
            {
                label: 'Code',
                input: {
                    type: 'text',
                    binding: code,
                },
            }, {
                label: 'Name',
                input: {
                    type: 'text',
                    binding: name,
                },
            }, {
                label: 'Color',
                input: {
                    type: 'select',
                    binding: color,
                    options: colorsOptions,
                },
            }, {
                label: 'Location',
                input: {
                    type: 'select',
                    binding: location,
                    options: locationsOptions,
                    onSelect: setCurrentLocation,
                    controlValue: this.props.locations.selected ? this.props.locations.selected.id : null,
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
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
        code: 'Enter a code',
        name: 'Enter a name',
        color: 'Select a color',
        location: 'Select location',
    };

    Object.keys(requiredFields).forEach(
        field => {
            if (!values[field]) {
                errors[field] = requiredFields[field];
            }
        }
    );

    return errors;
}

export default reduxForm({
    form: 'CreateCourseForm',
    fields: ['code', 'name', 'color', 'location'],
    validate,
}, null, { createCourse, getCourses, setCurrentLocation })(CreateCourseForm);
