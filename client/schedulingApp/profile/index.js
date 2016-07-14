import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { getUserProfile, updateUserProfile } from './actions';


class Profile extends Component {
    componentWillMount() {
        this.props.getUserProfile();
    }

    render() {
        return (
            <div className="content">
              <div className="middle-help-message-wrap">
                <h1>WIP: this feature is coming soon!</h1>
              </div>
            </div>
        );
    }
}

export default connect(null, {
    getUserProfile,
    updateUserProfile,
})(Profile);
