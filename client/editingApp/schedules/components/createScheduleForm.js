import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { createSchedule, getSchedules } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { WEEKDAY_OPTIONS, TIME_OPTIONS } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../components/form/index';

class CreateScheduleForm extends Component {
    render() {
        const { weekday, time, location, tutors } = this.props.fields;
        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const tutorOptions = selectTransformOptions('id', 'name')(this.props.tutors.all);
        const weekdaysOptions = selectTransformOptions('value', 'display')(WEEKDAY_OPTIONS);
        const timeOptions = selectTransformOptions('value', 'display')(TIME_OPTIONS);


        const onSubmit = (data) => {
            this.props.createSchedule(data)
                .then(this.props.resetForm) // TODO: just reset the time, leave the rest
                .then(this.props.getSchedules);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Add a New Schedule';

        const fields = [
            {
                label: 'Weekday',
                input: {
                    type: 'select',
                    binding: weekday,
                    options: weekdaysOptions,
                },
            }, {
                label: 'Time',
                input: {
                    type: 'select',
                    binding: time,
                    options: timeOptions,
                },
            }, {
                label: 'Location',
                input: {
                    type: 'select',
                    binding: location,
                    options: locationsOptions,
                },
            }, {
                label: 'Tutors',
                input: {
                    type: 'multiselect',
                    binding: tutors,
                    options: tutorOptions,
                },
            },
        ];
        return (
            <div className="form-wrap">
              <Form handleSubmit={handleSubmit}
                    title={title}
                    fields={fields} />
            </div>
        );
    }
}

function validate(values) {
    const errors = {};
    const requiredFields = {
        weekday: 'Select a weekday',
        time: 'Select a time',
        location: 'Choose a location',
        tutors: 'Choose tutors',
    };

    Object.keys(requiredFields).forEach(field => {
        if (!values[field]) {
            errors[field] = requiredFields[field];
        }
    });

    return errors;
}

export default reduxForm({
    form: 'CreateScheduleForm',
    fields: ['weekday', 'time', 'location', 'tutors'],
    validate,
}, null, { createSchedule, setCurrentLocation, getSchedules })(CreateScheduleForm);
