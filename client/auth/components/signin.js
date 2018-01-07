import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingSpinner from '../../components/loadingSpinner';
import MainContentWrap from '../../components/mainContentWrap';

import { OAUTH2_SIGNIN_URL } from '../constants';
import { saveSelectedOpenSpotInLocalStorage,
         clearOpenSpotSelection } from '../../schedulingApp/showSchedule/actions';
import schoolLogo from '../../assets/school-logo.png';


class Signin extends Component {
    constructor() {
        super();
        this.state = {
            initiated: false,
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
        this.setState(
            () => ({ initiated: true }));
    }

    render() {
        const Wrap = content => () => (
            <a href={OAUTH2_SIGNIN_URL}
               role="button"
               className="oauth2-link"
               onClick={this.initiateSignin.bind(this)}>
                <div className="oauth2-button-wrap">
                    {content}
                </div>
            </a>);

        const ButtonOrSpinner = this.state.initiated
              ? Wrap(<LoadingSpinner />)
              : Wrap([<img alt="School Logo" src={schoolLogo} key={0}/>,
                      <span key={1}>Sign in with your school account</span>]);

        return (
            <MainContentWrap>
                <div className="wrap">
                    <div className="auth-form-wrap">
                        <ButtonOrSpinner />
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
