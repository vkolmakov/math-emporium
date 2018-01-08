import React, { Component } from 'react';
import { connect } from 'react-redux';

import MainContentWrap from '../../../components/mainContentWrap';
import LocationsInfo from '../../../components/locationsInfo';
import LocationsImages from './components/locationsImages';

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
        if (this.props.util.isDesktop) {
            pageContent = [];
        } else {
            const Locations = () => (
                <div className="locations">
                  <button onClick={this.redirectToSchedule} className="schedule-appointment-button">
                    Schedule an appointment
                  </button>
                  <LocationsInfo shouldDisplayImageBackground></LocationsInfo>
                </div>
            );

            pageContent = [<Locations key="locations"></Locations>];
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
