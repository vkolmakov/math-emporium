import React, { Component } from 'react';
import { connect } from 'react-redux';

import { OAUTH2_SIGNIN_URL } from '../constants';
import { saveSelectedOpenSpotInLocalStorage } from '../../schedulingApp/showSchedule/actions';
import schoolLogo from '../../assets/school-logo.png';


class Signin extends Component {
    componentDidMount() {
        this.trySaveSelectedOpenSpot();
    }

    trySaveSelectedOpenSpot() {
        const { selectedOpenSpotInfo } = this.props;
        const { course, location, time } = selectedOpenSpotInfo;
        if (course && location && time) {
            this.props.saveSelectedOpenSpotInLocalStorage(selectedOpenSpotInfo);
        }
    }

    render() {
        return (
            <div className="wrap">
                <div className="auth-form-wrap">
                    <a href={OAUTH2_SIGNIN_URL} className="oauth2-link">
                        <div className="oauth2-wrap">
                            <img alt="School Logo" src={schoolLogo}/>
                            <span>Sign in with your school account</span>
                        </div>
                    </a>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedOpenSpotInfo: state.scheduling.showSchedule.selectedOpenSpotInfo,
    };
}

export default connect(mapStateToProps, {
    saveSelectedOpenSpotInLocalStorage,
})(Signin);
