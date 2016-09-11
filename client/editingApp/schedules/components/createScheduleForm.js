import React, { Component } from 'react';
import { reduxForm, initialize, change } from 'redux-form';

import { createSchedule, getSchedules, setCurrentWeekday } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { WEEKDAY_OPTIONS, TIME_OPTIONS } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../../components/form/index';

const FORM_NAME = 'CreateScheduleForm';
const FORM_FIELDS = ['weekday', 'time', 'location', 'tutors'];

class CreateScheduleForm extends Component {
    componentWillMount() {
        const selectedLocation = this.props.locations.selected;
        if (selectedLocation) {
            this.props.dispatch(change(FORM_NAME, 'location', selectedLocation.id));
        }

        const selectedWeekday = this.props.schedules.selectedWeekday;
        if (selectedWeekday) {
            this.props.dispatch(change(FORM_NAME, 'weekday', selectedWeekday));
        }
    }

    componentWillUpdate(nextProps) {
        const currentLocation = nextProps.locations.selected;
        const prevLocation = this.props.locations.selected;

        if (!currentLocation && prevLocation) {
            this.props.dispatch(change(FORM_NAME, 'location', null));
            this.props.dispatch(change(FORM_NAME, 'tutors', []));
        } else if ((currentLocation && !prevLocation) || (prevLocation && currentLocation.id != prevLocation.id)) {
            this.props.dispatch(change(FORM_NAME, 'location', currentLocation.id));
            this.props.dispatch(change(FORM_NAME, 'tutors', []));
        }

        const currentWeekday = nextProps.schedules.selectedWeekday;
        const prevWeekday = this.props.schedules.selectedWeekday;

        if (!currentWeekday && prevWeekday) {
            this.props.dispatch(change(FORM_NAME, 'weekday', null));
        } else if ((currentWeekday && !prevWeekday) || (prevWeekday && currentWeekday != prevWeekday)) {
            this.props.dispatch(change(FORM_NAME, 'weekday', currentWeekday));
        }
    }

    render() {
        const { weekday, time, location, tutors } = this.props.fields;
        const { setCurrentLocation, setCurrentWeekday } = this.props;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const tutorsOptions = selectTransformOptions('id', 'name')(this.props.tutors.all);
        const weekdaysOptions = selectTransformOptions('value', 'display')(WEEKDAY_OPTIONS);
        const timeOptions = selectTransformOptions('value', 'display')(TIME_OPTIONS);

        const onSubmit = (data) => {
            this.props.createSchedule(data)
                .then(result => {
                    if (result.error) {
                        return new Promise(resolve => resolve(null));
                    }
                    return this.props.dispatch(initialize(FORM_NAME, {
                        location: this.props.locations.selected ? this.props.locations.selected.id : null,
                        weekday: this.props.schedules.selectedWeekday || null,
                    }, FORM_FIELDS));
                })
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
                    onSelect: setCurrentWeekday,
                    controlValue: this.props.schedules.selectedWeekday || null,
                },
            }, {
                label: 'Time',
                input: {
                    type: 'multiselect',
                    binding: time,
                    options: timeOptions,
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
                label: 'Tutors',
                input: {
                    type: 'multiselect',
                    binding: tutors,
                    options: tutorsOptions,
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.schedules.error,
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
    form: FORM_NAME,
    fields: FORM_FIELDS,
    validate,
}, null, { createSchedule, setCurrentLocation, getSchedules, setCurrentWeekday })(CreateScheduleForm);
