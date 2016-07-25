import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';

import { signinUser, authError, clearAuthError } from '../actions';

import Form from '../../components/form/index';
import LoadingSpinner from '../../components/loadingSpinner';

class Signin extends Component {
    constructor() {
        super();
        this.state = {
            forceLoadingSpinner: false,
        };
    }

    componentWillMount() {
        this.props.clearAuthError();
    }

    render() {
        const { fields: { email, password } } = this.props;

        if (this.state.forceLoadingSpinner) {
            return (
                <div className="auth-form-wrap">
                  <LoadingSpinner />
                </div>
            );
        }

        const onSubmit = ({ email, password }) => {
            this.setState({
                forceLoadingSpinner: true,
            });
            this.props.signinUser({ email, password })
                .then((_) => {
                    this.setState({
                        forceLoadingSpinner: false,
                    });
                });
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Sign in';

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
                <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
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
        // TODO: add a tip for school email and require one
        errors.email = 'Use a valid email address';
    }

    if (values.password && values.password.length <= minPasswordLength) {
        errors.password = `Your password was at least ${minPasswordLength} characters long`;
    }

    return errors;
}


export default reduxForm({
    form: 'SigninForm',
    fields: ['email', 'password'],
    validate,
}, mapStateToProps, { signinUser, authError, clearAuthError })(Signin);
