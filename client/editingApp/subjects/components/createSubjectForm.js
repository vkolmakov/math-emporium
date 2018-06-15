import React, { Component } from "react";
import { reduxForm, initialize, change } from "redux-form";

import { createSubject, getSubjects } from "../actions";
import { setCurrentLocation } from "../../locations/actions";

import { selectTransformOptions } from "../../utils";
import Form from "../../../components/form/index";

const FORM_NAME = "CreateSubjectForm";
const FORM_FIELDS = ["name", "location"];

class CreateSubjectForm extends Component {
    componentWillMount() {
        const selectedLocation = this.props.locations.selected;
        if (selectedLocation) {
            this.props.dispatch(
                change(FORM_NAME, "location", selectedLocation.id),
            );
        }
    }

    componentWillUpdate(nextProps) {
        const currentLocation = nextProps.locations.selected;
        const prevLocation = this.props.locations.selected;

        if (!currentLocation && prevLocation) {
            this.props.dispatch(change(FORM_NAME, "location", null));
        } else if (
            (currentLocation && !prevLocation) ||
            (prevLocation && currentLocation.id != prevLocation.id)
        ) {
            this.props.dispatch(
                change(FORM_NAME, "location", currentLocation.id),
            );
        }
    }

    render() {
        const { name, location } = this.props.fields;

        const { setCurrentLocation } = this.props;

        const locationsOptions = selectTransformOptions()(
            this.props.locations.all,
        );

        const onSubmit = (data) => {
            this.props
                .createSubject(data)
                .then((result) => {
                    if (result.error) {
                        return Promise.resolve();
                    } else {
                        return this.props.dispatch(
                            initialize(
                                FORM_NAME,
                                {
                                    location: this.props.locations.selected
                                        ? this.props.locations.selected.id
                                        : null,
                                },
                                FORM_FIELDS,
                            ),
                        );
                    }
                })
                .then(this.props.getSubjects);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = "Add a New Subject";

        const fields = [
            {
                label: "Name",
                input: {
                    type: "text",
                    binding: name,
                    placeholder: "e.g. MATH",
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
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.subjects.error,
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
        location: "Select location",
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
    { createSubject, getSubjects, setCurrentLocation },
)(CreateSubjectForm);
