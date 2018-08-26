import React, { Component } from "react";
import { connect } from "react-redux";
import TimerMixin from "react-timer-mixin";
import reactMixin from "react-mixin";

import { signoutUser } from "../actions";

import MainContentWrap from "../../components/mainContentWrap";
import { OAUTH2_PROVIDER_SIGNOUT_URL } from "../constants";
import { redirectOutside } from "../../utils";

class Signout extends Component {
    componentWillMount() {
        this.props.signoutUser();
        const redirectToOauthProviderSignout = () => {
            redirectOutside(OAUTH2_PROVIDER_SIGNOUT_URL);
        };

        setTimeout(redirectToOauthProviderSignout, 4000);
    }

    render() {
        return (
            <MainContentWrap>
                <div className="wrap">
                    <div className="auth-content-wrap">
                        <div className="signout-message">
                            <h1>Goodbye!</h1>
                            <p>
                                We will redirect you to sign out of your school
                                account in a moment...
                            </p>
                            <p>
                                You can also click{" "}
                                <a href={OAUTH2_PROVIDER_SIGNOUT_URL}>here</a>{" "}
                                to sign out of your school account right away.
                            </p>
                        </div>
                    </div>
                </div>
            </MainContentWrap>
        );
    }
}

reactMixin(Signout.prototype, TimerMixin);

export default connect(
    null,
    { signoutUser }
)(Signout);
