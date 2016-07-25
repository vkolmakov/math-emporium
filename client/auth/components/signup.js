import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';

import { signupUser, clearAuthError, authError } from '../actions';

import Form from '../../components/form/index';
import LoadingSpinner from '../../components/loadingSpinner';

class Signup extends Component {
    constructor() {
        super();
        this.state = {
            forceLoadingSpinner: false,
            displayActivationEmailMessage: false,
        };
    }

    componentWillMount() {
        this.props.clearAuthError();
    }

    render() {
        const { fields: { email, password, passwordConfirm } } = this.props;

        const onSubmit = ({ email, password }) => {
            this.setState({
                forceLoadingSpinner: true,
            });
            this.props.signupUser({ email, password })
                .then(_ => {
                    this.setState({
                        forceLoadingSpinner: false,
                        dipslayActivationEmailMessage: true,
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

        const title = 'Sign up';

        const fields = [
            {
                label: 'email',
                input: {
                    type: 'email',
                    binding: email,
                },
            }, {
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

        if (this.state.dipslayActivationEmailMessage) {
            return (
                <div className="auth-form-wrap">
                  <h1>Check your email for a confirmation link</h1>
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
                <p>Already have an account? <Link to="/signin">Sign in</Link></p>
                <p>Need to resend an activation email? <Link to="/resend-activation-email">Click here</Link></p>
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
        email: 'Enter an email address',
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

    if (values.email && !values.email.match(/.+@.+\.\w+/)) {
        // TODO: Only accept school emails
        errors.email = 'Use a valid email address';
    }

    if (values.password && values.password.length <= minPasswordLength) {
        errors.password = `Your password must be at least ${minPasswordLength} characters long`;
    } else if (values.password !== values.passwordConfirm) {
        errors.passwordConfirm = 'Passwords must match';
    }

    return errors;
}

export default reduxForm({
    form: 'SignupForm',
    fields: ['email', 'password', 'passwordConfirm'],
    validate,
}, mapStateToProps, { signupUser, clearAuthError, authError })(Signup);
