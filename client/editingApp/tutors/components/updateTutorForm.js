import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';

import { updateTutor, getTutors } from '../actions';
import { setCurrentLocation } from '../../locations/actions';
import { ROUTES } from '../../constants';
import { selectTransformOptions, redirectTo, noop } from '../../../utils';

import Form from '../../../components/form/index';

class UpdateTutorForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { name, courses, location } = this.props.selectedTutor;

        this.props.dispatch(initialize('UpdateTutorForm', {
            name,
            location: location.id,
            courses: selectTransformOptions('id', 'code')(courses),
        }, ['name', 'location', 'courses']));
    }

    render() {
        const { name, location, courses } = this.props.fields;
        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const coursesOptions = selectTransformOptions('id', 'code')(this.props.courses.all);

        const { selectedTutor } = this.props;
        const { setCurrentLocation } = this.props;

        const onSubmit = (data) => {
            this.props.updateTutor(this.props.selectedTutor.id, data)
                .then(result => redirectTo(ROUTES.TUTORS),
                      noop);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update a Tutor';

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

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.tutors.error,
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
    form: 'UpdateTutorForm',
    fields: ['name', 'location', 'courses'],
    // setting initial values
    validate,
}, null, { updateTutor, setCurrentLocation, getTutors })(UpdateTutorForm);
