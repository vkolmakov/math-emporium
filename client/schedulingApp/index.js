import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar';
import LoadingSpinner from '../components/loadingSpinner';
import { BASE_PATH } from './constants';
import { getLocations, getCourses } from './actions';
import { getUserProfileAndSetOpenSpotsData } from './profile/actions';

class SchedulingApp extends Component {
    componentWillMount() {
        // collect all the data at the start
        this.props.getLocations();
        this.props.getCourses();
        if (this.props.authenticated) {
            this.props.getUserProfileAndSetOpenSpotsData();
        }
    }

    render() {
        const { authenticated } = this.props;

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

        return (
            <div className="wrap">
              <Sidebar {...sidebarConfig} />
              {this.props.children}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getCourses,
    getUserProfileAndSetOpenSpotsData,
})(SchedulingApp);
