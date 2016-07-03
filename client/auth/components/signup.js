import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { signupUser } from '../actions';

import Form from '../../editingApp/components/form/index';

class Signup extends Component {
    render() {
        const { fields: { email, password, passwordConfirm } } = this.props;

        const onSubmit = ({ email, password }) => {
            this.props.signupUser({ email, password });
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Sign up';

        const fields = [
            {
                label: 'email',
                input: {
                    type: 'text',
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
}, mapStateToProps, { signupUser })(Signup);
