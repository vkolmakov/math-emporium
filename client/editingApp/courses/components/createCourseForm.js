import React, { Component } from 'react';
import { reduxForm, initialize, change } from 'redux-form';

import { createCourse, getCourses } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { GOOGLE_CALENDAR_COLORS } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../components/form/index';

const FORM_NAME = 'CreateCourseForm';
const FORM_FIELDS = ['code', 'name', 'color', 'location'];

class CreateCourseForm extends Component {
    componentWillMount() {
        const selectedLocation = this.props.locations.selected;
        if (selectedLocation) {
            this.props.dispatch(change(FORM_NAME, 'location', selectedLocation.id));
        }
    }

    componentWillUpdate(nextProps) {
        const currentLocation = nextProps.locations.selected;
        const prevLocation = this.props.locations.selected;

        if (!currentLocation && prevLocation) {
            this.props.dispatch(change(FORM_NAME, 'location', null));
        } else if ((currentLocation && !prevLocation) || (prevLocation && currentLocation.id != prevLocation.id)) {
            this.props.dispatch(change(FORM_NAME, 'location', currentLocation.id));
        }
    }

    render() {
        const { name, location, code, color } = this.props.fields;

        const { setCurrentLocation } = this.props;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const colorsOptions = selectTransformOptions('value', 'name', 'color')(GOOGLE_CALENDAR_COLORS);

        const onSubmit = (data) => {
            this.props.createCourse(data)
                .then(this.props.dispatch(initialize(FORM_NAME, {
                    location: this.props.locations.selected ? this.props.locations.selected.id : null,
                }, FORM_FIELDS)))
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
    form: FORM_NAME,
    fields: FORM_FIELDS,
    validate,
}, null, { createCourse, getCourses, setCurrentLocation })(CreateCourseForm);