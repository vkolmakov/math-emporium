import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { clearAuthError, resendActivationEmail } from '../actions';

import Form from '../../components/form/index';
import LoadingSpinner from '../../components/loadingSpinner';

class ResendActivationEmail extends Component {
    constructor() {
        super();
        this.state = {
            forceLoadingSpinner: false,
            displaySuccessMessage: false,
            displayMessage: null,
        };
    }

    componentWillMount() {
        this.props.clearAuthError();
    }

    render() {
        const { fields: { email } } = this.props;

        const onSubmit = ({ email }) => {
            this.setState({
                forceLoadingSpinner: true,
            });
            this.props.resendActivationEmail({ email })
                .then(_ => {
                    this.setState({
                        forceLoadingSpinner: false,
                        displayMessage: 'A new activation email was sent!',
                    });
                })
                .catch(error => {
                    const errorMessage = error.data.error;
                    this.setState({
                        forceLoadingSpinner: false,
                        displayMessage: `Couldn\'t send an email: ${errorMessage}`,
                    });
                });
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Resend activation email';

        const fields = [
            {
                label: 'email',
                input: {
                    type: 'email',
                    binding: email,
                },
            },
        ];

        if (this.state.forceLoadingSpinner) {
            return (
                <div className="auth-form-wrap">
                  <LoadingSpinner />
                </div>
            );
        }

        if (this.state.displayMessage) {
            return (
                <div className="auth-form-wrap">
                  <h1>{this.state.displayMessage}</h1>
                </div>
            );
        }


        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.props.errorMessage,
        };


        return (
            <div className="wrap">
              <div className="auth-form-wrap">
                <Form {...formConfig} />
              </div>
            </div>
        );
    }
}

function validate(values) {
    const errors = {};
    if (!values.email) {
        errors.email = 'Must provide an email address';
    }

    if (values.email && !values.email.match(/.+@.+\.\w+/)) {
        // TODO: add a tip for school email and require one
        errors.email = 'Use a valid email address';
    }

    return errors;
}


export default reduxForm({
    form: 'RequestActivationForm',
    fields: ['email'],
    validate,
}, null, { clearAuthError, resendActivationEmail })(ResendActivationEmail);
