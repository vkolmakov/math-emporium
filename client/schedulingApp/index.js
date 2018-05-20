import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar';
import LoadingSpinner from '../components/loadingSpinner';
import MainContentWrap from '../components/mainContentWrap';

import { BASE_PATH } from './constants';
import { getLocations, getCourses, getSubjects, markAsInitialized } from './actions';
import { getUserProfile, setOpenSpotDataFromProfile } from './profile/actions';

class SchedulingApp extends Component {
    componentDidMount() {
        const hasPreSelectedOpenSpot = !!this.props.preSelectedOpenSpotInfo.time
              && !!this.props.preSelectedOpenSpotInfo.course
              && !!this.props.preSelectedOpenSpotInfo.location;

        const hasPreSelectedLocation = !!this.props.locations.selected;
        const shouldInitializeLocations = !this.props.locations.all.length > 0;
        const shouldInitializeProfile = this.props.authenticated && !this.props.profile;

        // if no location or open spot are pre-selected, try to populate open spots data from user profile
        const shouldSetOpenSpotDataFromProfile = !(hasPreSelectedOpenSpot || hasPreSelectedLocation);

        if (!this.props.initialized) {
            Promise.all([
                shouldInitializeLocations ? this.props.getLocations() : Promise.resolve(),
                shouldInitializeProfile ? this.props.getUserProfile() : Promise.resolve(),
                this.props.getSubjects(),
                this.props.getCourses(),
            ]).then(() => {
                const profile = this.props.profile;
                if (this.props.authenticated && !!profile && shouldSetOpenSpotDataFromProfile) {
                    return this.props.setOpenSpotDataFromProfile(profile);
                }

                return Promise.resolve();
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
        profile: state.scheduling.profile.user,
        initialized: state.scheduling.shared.initialized,
        locations: {
            all: state.scheduling.shared.locations.all,
            selected: state.scheduling.shared.locations.selected,
        },
        preSelectedOpenSpotInfo: state.scheduling.showSchedule.selectedOpenSpotInfo,
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getSubjects,
    getCourses,
    getUserProfile,
    setOpenSpotDataFromProfile,
    markAsInitialized,
})(SchedulingApp);
