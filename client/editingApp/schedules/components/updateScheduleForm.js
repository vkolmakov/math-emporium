import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateSchedule, getSchedules, setCurrentWeekday } from '../actions';
import { setCurrentLocation } from '../../locations/actions';

import { redirectTo, id } from '../../../utils';
import { WEEKDAY_OPTIONS, TIME_OPTIONS, ROUTES } from '../../constants';

import { selectTransformOptions } from '../../utils';
import Form from '../../../components/form/index';

class UpdateScheduleForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { weekday, time, location, tutors } = this.props.selectedSchedule;

        const { locations } = this.props;

        const { setCurrentLocation, setCurrentWeekday } = this.props;

        const selectedLocation = locations.all.find(
            loc => loc.id == location.id
        );

        setCurrentLocation(selectedLocation);
        setCurrentWeekday(weekday);

        this.props.dispatch(initialize('UpdateScheduleForm', {
            weekday,
            time,
            location: location.id,
            tutors: tutors.map(tutor => ({ value: tutor.id, label: tutor.name })),
        }, ['weekday', 'time', 'location', 'tutors']));
    }


    render() {
        const { weekday, time, location, tutors } = this.props.fields;
        const { setCurrentLocation, getSchedules, setCurrentWeekday } = this.props;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const tutorOptions = selectTransformOptions('id', 'name')(this.props.tutors.all);
        const weekdaysOptions = selectTransformOptions('value', 'display')(WEEKDAY_OPTIONS);
        const timeOptions = selectTransformOptions('value', 'display')(TIME_OPTIONS);

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props.updateSchedule(this.props.selectedSchedule.id, data)
                .then(result => redirectTo(ROUTES.SCHEDULES),
                      id);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update a Schedule';

        const fields = [
            {
                label: 'Weekday',
                input: {
                    type: 'select',
                    binding: weekday,
                    options: weekdaysOptions,
                    onSelect: setCurrentWeekday,
                    controlValue: this.props.schedules.currentWeekday || null,
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
                    onSelect: setCurrentLocation,
                    controlValue: this.props.locations.selected ? this.props.locations.selected.id : null,
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

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.schedules.error,
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
        weekday: 'Select a weekday',
        time: 'Select time',
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
    form: 'UpdateScheduleForm',
    fields: ['weekday', 'time', 'location', 'tutors'],
    validate,
}, null, { updateSchedule, setCurrentLocation, getSchedules, setCurrentWeekday })(UpdateScheduleForm);
