import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

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

export default reduxForm({
    form: 'SigninForm',
    fields: ['email', 'password'],
}, mapStateToProps, { signinUser, authError, clearAuthError })(Signin);
