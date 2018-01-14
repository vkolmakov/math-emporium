import React, { Component } from 'react';
import { connect } from 'react-redux';

import MainContentWrap from '../../../components/mainContentWrap';
import LocationsInfo from '../../../components/locationsInfo';

import { getLocations } from '../../../sharedPublicData/actions';
import { redirectTo, backgroundPictureStyle, backgroundPictureOverlayStyle } from '../../../utils';

class Home extends Component {
    componentDidMount() {
        if (!this.props.locations.all.length > 0) {
            this.props.getLocations();
        }
    }

    redirectToSchedule() {
        redirectTo('/schedule');
    }

    render() {
        const Locations = () => (
            <div className="locations">
              <LocationsInfo shouldDisplayImageBackground></LocationsInfo>
            </div>
        );

        const ScheduleButton = () => (
            <button onClick={this.redirectToSchedule} className="schedule-appointment-button">
              Schedule an appointment
            </button>
        );

        const HomeHeader = () => (
            <div className="home-header" style={!!this.props.headerPictureLink ? backgroundPictureStyle(this.props.headerPictureLink) : {}}>
              <div className="home-header-overlay" style={!!this.props.headerPictureLink ? backgroundPictureOverlayStyle() : {}}>
                <div className="home-header-block">
                  <h1 className="home-header-title">{this.props.applicationTitle}</h1>
                  <h2>Study with us!</h2>
                  <ScheduleButton></ScheduleButton>
                </div>
              </div>
            </div>
        );

        return (
            <MainContentWrap>
              <div className="home-content-container">
                <HomeHeader key="leading-element"></HomeHeader>
                <Locations key="locations"></Locations>
              </div>
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: { all: state.sharedPublicData.locations.all },
        headerPictureLink: state.util.settings.applicationMainHomePictureLink,
        applicationTitle: state.util.settings.applicationTitle,
    };
}

export default connect(mapStateToProps, { getLocations })(Home);
