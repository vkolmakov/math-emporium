import React, { Component } from "react";
import { reduxForm, initialize, change } from "redux-form";

import Form from "../../../components/form/index";

import { updateUserProfile } from "../actions";
import { selectTransformOptions } from "../../../editingApp/utils";
import { isPotentialPhoneNumber } from "../../../utils";

const FORM_FIELDS = [
    "firstName",
    "lastName",
    "phoneNumber",
    "location",
    "course",
    "subject",
];
const FORM_NAME = "UpdateProfileForm";

class UpdateProfileForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
            error: null,
            selectedCourse: null,
            selectedLocation: null,
            selectedSubject: null,
        };
    }

    componentDidMount() {
        this.updateForm();
    }

    updateForm() {
        const {
            firstName,
            lastName,
            phoneNumber,
            location,
            course,
            subject,
        } = this.props.profile;
        this.props.dispatch(
            initialize(
                FORM_NAME,
                {
                    firstName: firstName || "",
                    lastName: lastName || "",
                    phoneNumber: phoneNumber || "",
                    location: location ? location.id : null,
                    course: course ? course.id : null,
                    subject: subject ? subject.id : null,
                },
                FORM_FIELDS
            )
        );
    }

    render() {
        const {
            firstName,
            lastName,
            phoneNumber,
            location,
            course,
            subject,
        } = this.props.fields;
        const locationsOptions = selectTransformOptions()(
            this.props.locations.all
        );

        let coursesOptions = [];
        let subjectsOptions = [];
        if (location.value) {
            const filteredSubjects = this.props.subjects.all.filter(
                (s) => s.location.id === location.value
            );
            subjectsOptions = filteredSubjects.map((s) => ({
                value: s.id,
                label: s.name,
            }));

            if (subject.value) {
                const filteredCourses = this.props.courses.all.filter(
                    (c) => c.subject.id === subject.value
                );
                coursesOptions = filteredCourses.map((c) => ({
                    value: c.id,
                    label: `${c.code}: ${c.name}`,
                }));
            }
        }

        const onSubmit = (data) => {
            this.setState({ success: false, error: null });

            if (this.props.submitCallback) {
                this.props.submitCallback();
            }
            this.props.updateUserProfile(data).then(
                () => {
                    this.setState({ success: true, error: null });
                },
                (err) => {
                    this.setState({ success: false, error: err.data.error });
                }
            );
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = "Update your profile";

        const fields = [
            {
                label: "First name",
                input: {
                    type: "text",
                    binding: firstName,
                },
            },
            {
                label: "Last name",
                input: {
                    type: "text",
                    binding: lastName,
                },
            },
            {
                label: "Phone number",
                input: {
                    type: "text",
                    binding: phoneNumber,
                },
            },
            {
                label: "Default location",
                input: {
                    type: "select",
                    binding: location,
                    options: locationsOptions,
                    searchable: false,
                    onSelect: (value) => {
                        this.props.dispatch(change(FORM_NAME, "course", null));
                        this.props.dispatch(change(FORM_NAME, "subject", null));
                        this.setState({
                            ...this.state,
                            selectedCourse: null,
                            selectedSubject: null,
                            selectedLocation: value
                                ? { id: value.value }
                                : null,
                        });
                    },
                    controlValue: this.state.selectedLocation
                        ? this.state.selectedLocation.id
                        : null,
                },
            },
            {
                label: "Default subject",
                input: {
                    type: "select",
                    binding: subject,
                    options: subjectsOptions,
                    searchable: false,
                    onSelect: (value) => {
                        this.props.dispatch(change(FORM_NAME, "course", null));
                        this.setState({
                            ...this.state,
                            selectedCourse: null,
                            selectedSubject: value ? { id: value.value } : null,
                        });
                    },
                    controlValue: this.state.selectedSubject
                        ? this.state.selectedSubject.id
                        : null,
                },
            },
            {
                label: "Default course",
                input: {
                    type: "select",
                    binding: course,
                    options: coursesOptions,
                    searchable: false,
                    onSelect: (value) => {
                        this.setState({
                            ...this.state,
                            selectedCourse: value ? { id: value.value } : null,
                        });
                    },
                    controlValue: this.state.selectedCourse
                        ? this.state.selectedCourse.id
                        : null,
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.state.error,
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
        firstName: "First name is required",
        lastName: "Last name is required",
        phoneNumber: "Valid phone number is required",
    };

    Object.keys(requiredFields).forEach((field) => {
        if (field === "phoneNumber") {
            if (!!values[field] && !isPotentialPhoneNumber(values[field])) {
                errors[field] = requiredFields[field];
            }
        } else {
            if (!values[field]) {
                errors[field] = requiredFields[field];
            }
        }
    });

    return errors;
}

export default reduxForm(
    {
        form: FORM_NAME,
        fields: FORM_FIELDS,
        validate,
    },
    null,
    { updateUserProfile }
)(UpdateProfileForm);
