import React, { Component } from 'react';
import { connect } from 'react-redux';

import MainContentWrap from '../../../components/mainContentWrap';
import LocationsInfo from '../../../components/locationsInfo';

import { getLocations } from '../../../sharedPublicData/actions';
import { redirectTo } from '../../../utils';
import { APP_TITLE } from '../../../constants';

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
        let pageContent;
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

        if (this.props.util.isDesktop) {
            const HomeHeader = () => (
                <div className="home-header">
                  <div className="home-header-block">
                    <h1 className="home-header-title">{APP_TITLE}</h1>
                    <h2>Study with us!</h2>
                    <ScheduleButton></ScheduleButton>
                  </div>
                </div>
            );

            pageContent = [<HomeHeader key="leading-element"></HomeHeader>,
                           <Locations key="locations"></Locations>];
        } else {
            pageContent = [<ScheduleButton key="leading-element"></ScheduleButton>,
                           <Locations key="locations"></Locations>];
        }

        return (
            <MainContentWrap>
              <div className="home-content-container">
                {pageContent}
              </div>
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: { all: state.sharedPublicData.locations.all },
        util: { isDesktop: state.util.isDesktop },
    };
}

export default connect(mapStateToProps, { getLocations })(Home);
