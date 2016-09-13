import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { clearAuthError, sendResetPasswordEmail } from '../actions';

import Form from '../../components/form/index';
import LoadingSpinner from '../../components/loadingSpinner';

const FORM_NAME = 'RequestResetPasswordForm';

class RequestResetPassword extends Component {
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
            this.props.sendResetPasswordEmail({ email })
                .then(_ => {
                    this.setState({
                        forceLoadingSpinner: false,
                        displayMessage: 'Password reset link was send to your email',
                    });
                })
                .catch(error => {
                    const errorMessage = error.data.error;
                    this.setState({
                        forceLoadingSpinner: false,
                        displayMessage: `Couldn't reset password: ${errorMessage}`,
                    });
                });
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));
        const title = 'Reset password';
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
    const email = { values };

    if (!email) {
        errors.email = 'Must provide an email address';
    }

    return errors;
}

export default reduxForm({
    form: FORM_NAME,
    fields: ['email'],
    validate,
}, null, { clearAuthError, sendResetPasswordEmail })(RequestResetPassword);
