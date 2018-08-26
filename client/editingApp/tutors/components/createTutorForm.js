import React, { Component } from "react";
import { reduxForm, initialize, change } from "redux-form";

import { createTutor, getTutors } from "../actions";
import { setCurrentLocation } from "../../locations/actions";

import { selectTransformOptions } from "../../utils";
import Form from "../../../components/form/index";

const FORM_NAME = "CreateTutorForm";
const FORM_FIELDS = ["name", "location", "courses"];

class CreateTutorForm extends Component {
    componentWillMount() {
        const selectedLocation = this.props.locations.selected;
        if (selectedLocation) {
            this.props.dispatch(
                change(FORM_NAME, "location", selectedLocation.id)
            );
        }
    }

    componentWillUpdate(nextProps) {
        const currentLocation = nextProps.locations.selected;
        const prevLocation = this.props.locations.selected;
        if (!currentLocation && prevLocation) {
            this.props.dispatch(change(FORM_NAME, "location", null));
            this.props.dispatch(change(FORM_NAME, "courses", []));
        } else if (
            (currentLocation && !prevLocation) ||
            (prevLocation && currentLocation.id !== prevLocation.id)
        ) {
            this.props.dispatch(
                change(FORM_NAME, "location", currentLocation.id)
            );
            this.props.dispatch(change(FORM_NAME, "courses", []));
        }
    }

    render() {
        const { name, location, courses } = this.props.fields;
        const locationsOptions = selectTransformOptions()(
            this.props.locations.all
        );
        const coursesOptions = selectTransformOptions("id", "code")(
            this.props.courses.all
        );

        const { setCurrentLocation } = this.props;

        const onSubmit = (data) => {
            this.props
                .createTutor(data)
                .then((result) => {
                    if (result.error) {
                        return Promise.resolve();
                    }
                    return this.props.dispatch(
                        initialize(
                            FORM_NAME,
                            {
                                location: this.props.locations.selected
                                    ? this.props.locations.selected.id
                                    : null,
                            },
                            FORM_FIELDS
                        )
                    );
                })
                .then(this.props.getTutors);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = "Add a New Tutor";

        const fields = [
            {
                label: "Name",
                input: {
                    type: "text",
                    binding: name,
                    placeholder: "e.g. JohnD",
                },
            },
            {
                label: "Location",
                input: {
                    type: "select",
                    binding: location,
                    options: locationsOptions,
                    onSelect: setCurrentLocation,
                    controlValue: this.props.locations.selected
                        ? this.props.locations.selected.id
                        : null,
                },
            },
            {
                label: "Courses",
                input: {
                    type: "multiselect",
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
        name: "Enter a name",
        location: "Choose a location",
    };

    Object.keys(requiredFields).forEach((field) => {
        if (!values[field]) {
            errors[field] = requiredFields[field];
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
    { createTutor, setCurrentLocation, getTutors }
)(CreateTutorForm);
