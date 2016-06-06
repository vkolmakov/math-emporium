import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createTutor, getTutors } from './actions';
import { setCurrentLocation } from '../locations/actions';

import { selectTransformOptions } from '../utils';
import Select from '../components/select/reactSelectWrapper';

class CreateTutorForm extends Component {
    render() {
        const handleSubmit = this.props.handleSubmit;
        const { name, location, courses } = this.props.fields;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const coursesOptions = selectTransformOptions('id', 'code')(this.props.courses.all);

        return (
            <div className="form-wrap">
              <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <h2>Add a New Tutor</h2>

                <div className="form-field">
                  <label>Name</label>
                  <div className="form-input-group">
                    <input type="text" {...name}/>
                    <span className="form-help">{name.touched ? name.error : ''}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Location</label>
                  <div className="form-input-group">
                    <Select options={locationsOptions}
                            binding={location} />
                    <span className="form-help">{location.touched ? location.error : ''}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Courses</label>
                  <div className="form-input-group">
                    <Select options={coursesOptions}
                            binding={courses}
                            multi={true} />
                  </div>
                </div>

                <div className="form-field">
                  <button className="button" type="submit">Submit</button>
                </div>
              </form>
            </div>
        );
    }

    onSubmit(data) {
        this.props.createTutor(data)
            .then(this.props.resetForm)
            .then(this.props.getTutors);
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
