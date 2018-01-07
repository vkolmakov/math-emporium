import React, { Component } from 'react';
import { connect } from 'react-redux';

import MainContentWrap from '../../../components/mainContentWrap';
import LocationsInfo from '../../../components/locationsInfo';
import LocationsImages from './components/locationsImages';

import { getLocations } from '../../../sharedPublicData/actions';

class Home extends Component {
    componentDidMount() {
        if (!this.props.locations.all.length > 0) {
            this.props.getLocations();
        }
    }

    render() {
        const pageContent = this.props.util.isDesktop
              ? [<LocationsImages></LocationsImages>,
                 <LocationsInfo></LocationsInfo>]
              : [<LocationsInfo></LocationsInfo>];

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
