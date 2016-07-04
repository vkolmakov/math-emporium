import React, { Component } from 'react';
import { connect } from 'react-redux';

import { activateUser } from '../actions';

class Activate extends Component {
    componentWillMount() {
        const { activationToken } = this.props.params;
        const activateUser = this.props.activateUser;
        if (activationToken) {
            activateUser({ activationToken });
        }
    }

    render() {
        const error = this.props.error;
        const { activationToken } = this.props.params;

        let message;

        if (error) {
            message = error;
        } else if (activationToken) {
            message = 'Your account is now activated';
        } else {
            message = 'Check your email for an activation token';
        }

        return (
            <div className="auth-form-wrap">
              <h1>{message}</h1>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        error: state.auth.error,

    };
}

export default connect(
    mapStateToProps,
    { activateUser })(Activate);
