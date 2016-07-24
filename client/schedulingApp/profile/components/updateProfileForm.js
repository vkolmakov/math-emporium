import React, { Component } from 'react';
import { reduxForm, initialize, change } from 'redux-form';

import Form from '../../../components/form/index';

import { updateUserProfile } from '../actions';
import { setLocation, setCourse } from '../../actions';
import { selectTransformOptions } from '../../../editingApp/utils';

const FORM_FIELDS = ['firstName', 'lastName', 'location', 'course'];
const FORM_NAME = 'UpdateProfileForm';

class UpdateProfileForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
            selectedCourse: null,
            selectedLocation: null,
        };
    }

    componentWillMount() {
        this.updateForm();
    }

    updateForm() {
        const { firstName, lastName, location, course } = this.props.profile;
        this.props.dispatch(initialize(FORM_NAME, {
            firstName: firstName || '',
            lastName: lastName || '',
            location: location ? location.id : null,
            course: course ? course.id : null,
        }, FORM_FIELDS));
    }

    render() {
        const { firstName, lastName, location, course } = this.props.fields;

        const locationsOptions = selectTransformOptions()(this.props.locations.all);

        let coursesOptions;
        if (!location.value) { // doing a stupid lookup on form props
            coursesOptions = [];
        } else {
            const filteredCourses = this.props.courses.all.filter(c => c.location.id === location.value);
            coursesOptions = filteredCourses.map(c => ({
                value: c.id,
                label: `${c.code}: ${c.name}`,
            }));
        }

        const onSubmit = (data) => {
            if (this.props.submitCallback) {
                this.props.submitCallback();
            }
            this.props.updateUserProfile(data);
            this.setState({ success: true });
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
                    onSelect: (value) => {
                        this.props.dispatch(change(FORM_NAME, 'course', null));
                        this.setState({
                            ...this.state,
                            selectedCourse: null,
                            selectedLocation: value ? { id: value.value } : null,
                        });
                    },
                    controlValue: this.state.selectedLocation ? this.state.selectedLocation.id : null,
                },
            }, {
                label: 'Course',
                input: {
                    type: 'select',
                    binding: course,
                    options: coursesOptions,
                    onSelect: (value) => {
                        this.setState({
                            ...this.state,
                            selectedCourse: value ? { id: value.value } : null,
                        });
                    },
                    controlValue: this.state.selectedCourse ? this.state.selectedCourse.id : null,
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


function validate(values) {
    const errors = {};
    const requiredFields = {
        firstName: 'First name is required',
        lastName: 'Last name is required',
    };

    Object.keys(requiredFields).forEach(
        field => {
            if (!values[field]) errors[field] = requiredFields[field];
        }
    );

    return errors;
}

export default reduxForm({
    form: FORM_NAME,
    fields: FORM_FIELDS,
    validate,
}, null, { updateUserProfile, setLocation, setCourse })(UpdateProfileForm);
