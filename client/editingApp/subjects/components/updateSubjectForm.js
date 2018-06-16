import React, { Component } from "react";
import { reduxForm, initialize } from "redux-form";

import { updateSubject, getSubjects } from "../actions";
import { setCurrentLocation } from "../../locations/actions";
import { S, redirectTo, id } from "@client/utils";
import withRouterContext from "@client/routing/withRouterContext";

import { ROUTES } from "../../constants";

import { selectTransformOptions } from "../../utils";
import Form from "@client/components/form/index";

class UpdateSubjectForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentWillMount() {
        const { name, location } = this.props.selectedSubject;

        this.props.dispatch(
            initialize(
                "UpdateSubjectForm",
                {
                    name,
                    location: location.id,
                },
                ["name", "location"],
            ),
        );
    }

    render() {
        const { name, location } = this.props.fields;

        const { setCurrentLocation } = this.props;

        const locationsOptions = selectTransformOptions()(
            this.props.locations.all,
        );

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props
                .updateSubject(this.props.selectedSubject.id, data)
                .then(
                    () => redirectTo(this.props.history, ROUTES.SUBJECTS),
                    id,
                );
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = "Update a Subject";

        const fields = [
            {
                label: "Name",
                input: {
                    type: "text",
                    binding: name,
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

export default S.compose(
    withRouterContext,
    reduxForm(
        {
            form: "UpdateSubjectForm",
            fields: ["name", "location"],
            validate,
        },
        null,
        { updateSubject, getSubjects, setCurrentLocation },
    ),
)(UpdateSubjectForm);
