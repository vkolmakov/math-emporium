import React, { Component } from 'react';
import { connect } from 'react-redux';

import MainContentWrap from '../../../components/mainContentWrap';
import LocationsInfo from '../../../components/locationsInfo';

import { getLocations } from '../../../sharedPublicData/actions';
import { redirectTo } from '../../../utils';

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


        if (this.props.util.isDesktop) {
            pageContent = [<Locations key="locations"></Locations>];
        } else {
            const ScheduleButton = () => (
                <button onClick={this.redirectToSchedule} className="schedule-appointment-button">
                  Schedule an appointment
                </button>
            );

            pageContent = [<ScheduleButton></ScheduleButton>,
                           <Locations key="locations"></Locations>,
                          ];
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
