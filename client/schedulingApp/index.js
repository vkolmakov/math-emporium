import React, { Component } from 'react';
import { connect } from 'react-redux';

import Route from '@client/routing/Route';
import Redirect from '@client/routing/Redirect';
import Switch from '@client/routing/Switch';

import RequireAuthGroup from '@client/auth/components/requireAuthGroup';

import Sidebar from '@client/components/sidebar';
import LoadingSpinner from '@client/components/loadingSpinner';
import MainContentWrap from '@client/components/mainContentWrap';

import { ROUTE_BASE_PATHS, AUTH_GROUPS } from '@client/constants';

import { getLocations, getCourses, getSubjects, markAsInitialized } from './actions';
import { getUserProfile, setOpenSpotDataFromProfile } from './profile/actions';

import ShowSchedule from './showSchedule/index';
import Profile from './profile/index';

const BASE_PATH = ROUTE_BASE_PATHS.SCHEDULE;

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
                ['profile', 'Profile and Appointments'],
            ];
        } else {
            links = [
                ['show', 'Schedule'],
            ];
        }

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        const isReady = !authenticated || (authenticated && profile && initialized);

        if (!isReady) {
            return (
                <MainContentWrap>
                  <div className="wrap">
                    <div className="main-content">
                      <LoadingSpinner></LoadingSpinner>
                    </div>
                  </div>
                </MainContentWrap>
            );
        }

        return (
            <MainContentWrap>
              <div className="wrap">
                <Sidebar {...sidebarConfig}></Sidebar>
                <Switch>
                  <Redirect exact from={`/${BASE_PATH}`} to={`/${BASE_PATH}/show`}></Redirect>
                  <Route exact path={`/${BASE_PATH}/show`} component={ShowSchedule}></Route>
                  <Route exact path={`/${BASE_PATH}/profile`} component={RequireAuthGroup(AUTH_GROUPS.user)(Profile)}></Route>
                </Switch>
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
