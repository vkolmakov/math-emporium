import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { resetPassword, authError, clearAuthError } from '../actions';

import Form from '../../components/form/index';
import LoadingSpinner from '../../components/loadingSpinner';

class ResetPassword extends Component {
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
        const { fields: { password, passwordConfirm } } = this.props;

        const onSubmit = ({ password }) => {
            const { token } = this.props.params;
            this.setState({
                forceLoadingSpinner: true,
            });
            this.props.resetPassword({ password, token })
                .then(_ => {
                    this.setState({
                        forceLoadingSpinner: false,
                        displaySuccessMessage: true,
                    });
                })
                .catch(error => {
                    const errorMessage = error.data.error;
                    this.setState({
                        forceLoadingSpinner: false,
                    });
                    this.props.authError(errorMessage);
                });
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Reset Password';

        const fields = [
            {
                label: 'password',
                input: {
                    type: 'password',
                    binding: password,
                },
            }, {
                label: 'confirm password',
                input: {
                    type: 'password',
                    binding: passwordConfirm,
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

        if (this.state.displaySuccessMessage) {
            return (
                <div className="auth-form-wrap">
                    <h1>Your password was reset. You may login with your new password</h1>
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

function mapStateToProps(state) {
    return {
        errorMessage: state.auth.error,
    };
}

function validate(values) {
    const errors = {};

    const requiredFields = {
        password: 'Enter a password',
        passwordConfirm: 'Confirm your password',
    };
    const minPasswordLength = 8;

    Object.keys(requiredFields).forEach(
        field => {
            if (!values[field]) {
                errors[field] = requiredFields[field];
            }
        }
    );

    if (values.password && values.password.length <= minPasswordLength) {
        errors.password = `Your password must be at least ${minPasswordLength} characters long`;
    } else if (values.password !== values.passwordConfirm) {
        errors.passwordConfirm = 'Passwords must match';
    }

    return errors;
}

export default reduxForm({
    form: 'ResetPasswordForm',
    fields: ['password', 'passwordConfirm'],
    validate,
}, mapStateToProps, { resetPassword, authError, clearAuthError })(ResetPassword);
