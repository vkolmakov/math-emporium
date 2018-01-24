import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingSpinner from '../../components/loadingSpinner';
import MainContentWrap from '../../components/mainContentWrap';

import { OAUTH2_SIGNIN_URL } from '../constants';
import { redirectOutside } from '../../utils';
import { saveSelectedOpenSpotInLocalStorage,
         clearOpenSpotSelection } from '../../schedulingApp/showSchedule/actions';
import schoolLogo from '../../assets/school-logo.png';


class Signin extends Component {
    constructor() {
        super();
        this.state = {
            initiated: false,
            buttonWidthBeforeInitialization: 'auto',
        };
    }

    componentDidMount() {
        this.trySaveSelectedOpenSpot();
    }

    trySaveSelectedOpenSpot() {
        const { selectedOpenSpotInfo } = this.props;
        const { course, location, time, subject } = selectedOpenSpotInfo;
        if (course && location && time && subject) {
            this.props.saveSelectedOpenSpotInLocalStorage(selectedOpenSpotInfo);
            this.props.clearOpenSpotSelection();
        }
    }

    initiateSignin() {
        // button width has to be stashed to prevent jump in button width when transitioning to spinner
        const buttonWidthBeforeInitialization = !!this.authButtonRef
              ? `${this.authButtonRef.offsetWidth.toString()}px`
              : 'auto';

        this.setState(() => ({ initiated: true, buttonWidthBeforeInitialization }));
        redirectOutside(OAUTH2_SIGNIN_URL);
    }

    render() {
        const getAuthButtonRefAndFocus = (buttonRef) => {
            if (buttonRef) {
                buttonRef.focus(); this.authButtonRef = buttonRef;
            }
        };

        const AuthButton = () => (
            <button className="oauth2-button"
                    onClick={this.initiateSignin.bind(this)}
                    ref={getAuthButtonRefAndFocus}>
              <div className="oauth2-button-content">
                <img className="oauth2-button-content-logo" alt="School Logo" src={schoolLogo} />
                <span className="oauth2-button-content-text">Sign in with your school account</span>
              </div>
            </button>
        );

        const SpinnerButton = () => (
            <button disabled className="oauth2-button"
                    style={{ width: this.state.buttonWidthBeforeInitialization }}>
              <div className="oauth2-button-content">
                <LoadingSpinner />
              </div>
            </button>
        );

        const AuthOrSpinnerButton = this.state.initiated ? SpinnerButton : AuthButton;

        return (
            <MainContentWrap>
              <div className="wrap">
                <div className="auth-content-wrap">
                  <AuthOrSpinnerButton></AuthOrSpinnerButton>
                </div>
              </div>
            </MainContentWrap>
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
    clearOpenSpotSelection,
})(Signin);
