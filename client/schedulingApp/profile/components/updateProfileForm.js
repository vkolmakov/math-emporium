import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';
import moment from 'moment';

import Form from '../../../components/form/index';

import { updateUserProfile } from '../actions';
import { selectTransformOptions } from '../../../editingApp/utils';

const FORM_FIELDS = ['firstName', 'lastName', 'location', 'course'];

class UpdateProfileForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentWillMount() {
        const { firstName, lastName, location, course } = this.props.profile;

        this.props.dispatch(initialize('UpdateProfileForm', {
            firstName,
            lastName,
            location,
            course,
        }, FORM_FIELDS));
    }

    render() {
        const { firstName, lastName, location, course } = this.props.fields;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);
        const coursesOptions = selectTransformOptions()(this.props.courses.all);

        const onSubmit = (data) => {
            console.log('submitted', data);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update your profile';

        const fields = [
            {
                label: 'First Name',
                input: {
                    type: 'text',
                    binding: firstName,
                },
            }, {
                label: 'Last Name',
                input: {
                    type: 'text',
                    binding: lastName,
                },
            }, {
                label: 'Location you usually go to for tutoring',
                input: {
                    type: 'select',
                    binding: location,
                    options: locationsOptions,
                },
            }, {
                label: 'Course',
                input: {
                    type: 'select',
                    binding: course,
                    options: coursesOptions,
                },
            }];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: null, // TODO
            success: this.state.success,
        };

        return (
            <div className="edit-profile-form-wrap">
              <Form {...formConfig} />
            </div>
        );
    }

}


function validate() {
    const errors = {};

    return errors;
}

export default reduxForm({
    form: 'UpdateProfileForm',
    fields: FORM_FIELDS,
    validate,
}, null, { updateUserProfile })(UpdateProfileForm);
