import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';

import { signoutUser } from '../actions';
import { OAUTH2_PROVIDER_SIGNOUT_URL } from '../constants';

class Signout extends Component {
    componentWillMount() {
        this.props.signoutUser();
        const redirectToOauthProviderSignout = () =>
              window.location = OAUTH2_PROVIDER_SIGNOUT_URL;
        setTimeout(redirectToOauthProviderSignout, 4000);
    }

    render() {
        return (
            <div className="auth-form-wrap">
                <h1>Goodbye!</h1>
                <h2>We will redirect you to sign out of your school account in a moment...</h2>
            </div>
        );
    }
}

reactMixin(Signout.prototype, TimerMixin);

export default connect(null, { signoutUser })(Signout);
