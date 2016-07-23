import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import { signinUser, authError } from '../actions';

import Form from '../../components/form/index';

class Signin extends Component {
    render() {
        const { fields: { email, password } } = this.props;

        const onSubmit = ({ email, password }) => {
            this.props.signinUser({ email, password });
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
}, mapStateToProps, { signinUser, authError })(Signin);
