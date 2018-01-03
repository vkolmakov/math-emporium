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
        if (!this.props.initialized) {
            this.props.getLocations();
            this.props.getSubjects();
            this.props.getCourses();
            this.props.markAsInitialized();
        }

        if (this.props.authenticated) {
            this.props.getUserProfileAndSetOpenSpotsData();
        }
    }

    render() {
        const { authenticated, profile } = this.props;

        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        let links;
        if (authenticated) {
            links = [
                ['show', 'Show Schedule'],
                ['profile', 'My Profile'],
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

        const isReady = (authenticated && profile) || !authenticated;

        const maybeContent = isReady // TODO: Turn into a component after moving
              ? this.props.children  // updateProfileForm off the redux-form
              : <div className="content"><LoadingSpinner /></div>;

        return (
            <MainContentWrap>
                <div className="wrap">
                    <Sidebar {...sidebarConfig} />
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
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getSubjects,
    getCourses,
    getUserProfileAndSetOpenSpotsData,
    markAsInitialized,
})(SchedulingApp);
