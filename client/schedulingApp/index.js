import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar';
import LoadingSpinner from '../components/loadingSpinner';
import { BASE_PATH } from './constants';
import { getLocations, getCourses } from './actions';
import { getUserProfile } from './profile/actions';

class SchedulingApp extends Component {
    componentWillMount() {
        // collect all the data at the start
        this.props.getLocations();
        this.props.getCourses();
        this.props.getUserProfile();
    }

    render() {
        const { locations, courses } = this.props;

        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        const links = [
            ['show', 'Show Schedule'],
            ['profile', 'My Profile'],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        if (!(locations && courses)) {
            return (
                <div className="wrap">
                  <Sidebar {...sidebarConfig} />
                  <div className="content">
                    <LoadingSpinner />
                  </div>
                </div>
            );
        }

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
        locations: {
            all: state.scheduling.shared.locations.all,
            selected: state.scheduling.shared.locations.selected,
        },
        courses: {
            all: state.scheduling.shared.courses.all,
            selected: state.scheduling.shared.courses.selected,
        },
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getCourses,
    getUserProfile,
})(SchedulingApp);
