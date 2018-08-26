import React, { Component } from "react";
import { reduxForm, initialize } from "redux-form";

import withRouterContext from "@client/routing/withRouterContext";
import { redirectTo, id } from "@client/utils";
import Form from "@client/components/form/index";

import { updateLocation, getLocations } from "../actions";
import { ROUTES } from "../../constants";

const FORM_FIELDS = [
    "name",
    "isActive",
    "calendarId",
    "address",
    "phone",
    "email",
    "description",
    "pictureLink",
    "maximumAppointmentsPerLocation",
    "maximumAppointmentsPerSubject",
    "maximumAppointmentsPerCourse",
];

class UpdateLocationForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        this.props.dispatch(
            initialize(
                "UpdateLocationForm",
                this.props.selectedLocation,
                FORM_FIELDS
            )
        );
    }

    render() {
        const {
            name,
            isActive,
            calendarId,
            address,
            phone,
            email,
            description,
            pictureLink,
            maximumAppointmentsPerLocation,
            maximumAppointmentsPerSubject,
            maximumAppointmentsPerCourse,
        } = this.props.fields;

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props
                .updateLocation(this.props.selectedLocation.id, data)
                .then(
                    () => redirectTo(this.props.history, ROUTES.LOCATIONS),
                    id
                );
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = "Update a Location";

        const fields = [
            {
                label: "Name",
                input: { type: "text", binding: name },
            },
            {
                label: "Active",
                input: { type: "checkbox", binding: isActive },
            },
            {
                label: "Google Calendar ID",
                input: { type: "text", binding: calendarId },
            },
            {
                label: "Address",
                input: { type: "text", binding: address },
            },
            {
                label: "Phone",
                input: { type: "text", binding: phone },
            },
            {
                label: "Email",
                input: { type: "text", binding: email },
            },
            {
                label: "Description",
                input: { type: "textarea", binding: description },
            },
            {
                label: "Link to a picture",
                input: { type: "text", binding: pictureLink },
            },
            {
                label: "Maximum number of appointments per location",
                input: {
                    type: "text",
                    binding: maximumAppointmentsPerLocation,
                },
            },
            {
                label: "Maximum number of appointments per subject",
                input: { type: "text", binding: maximumAppointmentsPerSubject },
            },
            {
                label: "Maximum number of appointments per course",
                input: { type: "text", binding: maximumAppointmentsPerCourse },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.locations.error,
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
    const ensureNumber = (compare) => (numberString) => {
        const number = parseInt(numberString, 10);
        return !isNaN(number) && compare(number);
    };

    const ensureNonEmpty = (str) => !!str;

    const validators = {
        maximumAppointmentsPerLocation: {
            checkIfValid: ensureNumber((n) => n >= 1),
            error: "Enter a positive integer",
        },
        maximumAppointmentsPerSubject: {
            checkIfValid: ensureNumber((n) => n >= 1),
            error: "Enter a positive integer",
        },
        maximumAppointmentsPerCourse: {
            checkIfValid: ensureNumber((n) => n >= 1),
            error: "Enter a positive integer",
        },
        name: { checkIfValid: ensureNonEmpty, error: "Enter a name" },
        calendarId: {
            checkIfValid: ensureNonEmpty,
            error: "Enter a Google Calendar ID",
        },
    };

    const errors = Object.keys(validators).reduce((acc, fieldName) => {
        const { checkIfValid, error } = validators[fieldName];
        if (!checkIfValid(values[fieldName])) {
            acc[fieldName] = error;
        }
        return acc;
    }, {});

    return errors;
}

export default reduxForm(
    {
        form: "UpdateLocationForm",
        fields: FORM_FIELDS,
        validate,
    },
    null,
    { updateLocation, getLocations }
)(withRouterContext(UpdateLocationForm));
