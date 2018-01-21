import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar';
import LoadingSpinner from '../components/loadingSpinner';
import MainContentWrap from '../components/mainContentWrap';

import { BASE_PATH } from './constants';
import { getLocations, getCourses, getSubjects, markAsInitialized } from './actions';
import { getUserProfileAndSetOpenSpotsData } from './profile/actions';

class SchedulingApp extends Component {
    componentDidMount() {
        const alreadyInitializedLocations = this.props.locations.all.length > 0;
        // if no location is selected, try to populate open spots data from user profile
        const shouldSetOpenSpotsDataFromProfile = !this.props.locations.selected;

        if (!this.props.initialized) {
            Promise.all([
                alreadyInitializedLocations ? Promise.resolve() : this.props.getLocations(),
                this.props.getSubjects(),
                this.props.getCourses(),
            ]).then(() => {
                return this.props.authenticated && shouldSetOpenSpotsDataFromProfile
                    ? this.props.getUserProfileAndSetOpenSpotsData()
                    : Promise.resolve();
            }).then(() => this.props.markAsInitialized());
        }
    }

    render() {
        const { authenticated, profile, initialized } = this.props;

        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        let links;
        if (authenticated) {
            links = [
                ['show', 'Schedule'],
                ['profile', 'My Profile and Appointments'],
            ];
        } else {
            links = [
                ['show', 'Show Schedule'],
            ];
        }

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        const isReady = !authenticated || (authenticated && profile && initialized);


        const maybeContent = isReady
              ? this.props.children
              : <div className="main-content"><LoadingSpinner /></div>;

        return (
            <MainContentWrap>
              <div className="wrap">
                <Sidebar {...sidebarConfig}></Sidebar>
                {maybeContent}
                </div>
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
        profile: state.scheduling.profile,
        initialized: state.scheduling.shared.initialized,
        locations: {
            all: state.scheduling.shared.locations.all,
            selected: state.scheduling.shared.locations.selected,
        },
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getSubjects,
    getCourses,
    getUserProfileAndSetOpenSpotsData,
    markAsInitialized,
})(SchedulingApp);
