import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { createTutor, getTutors } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { selectTransformOptions } from '../../utils';
import Form from '../../components/form/index';

class CreateTutorForm extends Component {
    render() {
        const { name, location, courses } = this.props.fields;
        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const coursesOptions = selectTransformOptions('id', 'code')(this.props.courses.all);

        const { setCurrentLocation } = this.props;

        const onSubmit = (data) => {
            this.props.createTutor(data)
                .then(this.props.dispatch(initialize('CreateTutorForm', {
                    location: this.props.locations.selected ? this.props.locations.selected.id : null,
                }, ['name', 'location', 'courses'])))
                .then(this.props.getTutors);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Add a New Tutor';

        const fields = [
            {
                label: 'Name',
                input: {
                    type: 'text',
                    binding: name,
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
            }, {
                label: 'Courses',
                input: {
                    type: 'multiselect',
                    binding: courses,
                    options: coursesOptions,
                },
            },
        ];
        return (
            <div className="form-wrap">
              <Form handleSubmit={handleSubmit}
                    title={title}
                    fields={fields}/>
            </div>
        );
    }
}

function validate(values) {
    const errors = {};
    const requiredFields = {
        name: 'Enter a name',
        location: 'Choose a location',
    };

    Object.keys(requiredFields).forEach(field => {
        if (!values[field]) {
            errors[field] = requiredFields[field];
        }
    });

    return errors;
}

export default reduxForm({
    form: 'CreateTutorForm',
    fields: ['name', 'location', 'courses'],
    validate,
}, null, { createTutor, setCurrentLocation, getTutors })(CreateTutorForm);
