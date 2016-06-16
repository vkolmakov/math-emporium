import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateCourse, getCourses } from './actions';
import { setCurrentLocation } from '../locations/actions';

import { GOOGLE_CALENDAR_COLORS } from '../constants';

import { selectTransformOptions } from '../utils';
import Form from '../components/form/index';

class UpdateCourseForm extends Component {
    componentWillMount() {
        const { code, name, color, location } = this.props.selectedCourse;

        this.props.dispatch(initialize('UpdateCourseForm', {
            code,
            name,
            color,
            location: location.id,
        }, ['code', 'name', 'color', 'location']));
    }

    render() {
        const { name, location, code, color } = this.props.fields;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const colorsOptions = selectTransformOptions('value', 'name', 'color')(GOOGLE_CALENDAR_COLORS);

        const onSubmit = (data) => {
            this.props.updateCourse(this.props.selectedCourse.id, data)
                .then(this.props.getCourses);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update a Course';

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
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
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
    form: 'UpdateCourseForm',
    fields: ['code', 'name', 'color', 'location'],
    validate,
}, null, { updateCourse, getCourses, setCurrentLocation })(UpdateCourseForm);
