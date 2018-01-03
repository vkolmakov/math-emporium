import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateCourse, getCourses } from '../actions';
import { setCurrentLocation } from '../../locations/actions';
import { redirectTo, id } from '../../../utils';


import { GOOGLE_CALENDAR_COLORS, ROUTES } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../../components/form/index';

const FORM_FIELDS = ['code', 'subject', 'name', 'color', 'location'];

class UpdateCourseForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentWillMount() {
        const { code, name, color, location, subject } = this.props.selectedCourse;

        this.props.dispatch(initialize('UpdateCourseForm', {
            code,
            name,
            color,
            location: location.id,
            subject: subject.id,
        }, FORM_FIELDS));
    }

    render() {
        const { name, location, code, color, subject } = this.props.fields;

        const { setCurrentLocation } = this.props;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const colorsOptions = selectTransformOptions('value', 'name', 'color')(GOOGLE_CALENDAR_COLORS);
        const subjectOptions = selectTransformOptions()(this.props.subjects.all);

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props.updateCourse(this.props.selectedCourse.id, data)
                .then(result => redirectTo(ROUTES.COURSES),
                      id);
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
                label: 'Subject',
                input: {
                    type: 'select',
                    binding: subject,
                    options: subjectOptions,
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
            error: this.props.courses.error,
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
        code: 'Enter a code',
        name: 'Enter a name',
        color: 'Select a color',
        location: 'Select location',
        subject: 'Select a subject',
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
    fields: FORM_FIELDS,
    validate,
}, null, { updateCourse, getCourses, setCurrentLocation })(UpdateCourseForm);
