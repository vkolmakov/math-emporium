import React, { Component } from 'react';
import { connect } from 'react-redux';

import NextAppointment from './components/nextAppointment';
import UpdateProfileForm from './components/updateProfileForm';
import LoadingSpinner from '../../components/loadingSpinner';
import MainContentWrap from '../../components/mainContentWrap';

import { getUserProfile } from './actions';
import { getLocations, getCourses } from '../actions';

class Profile extends Component {
    componentWillMount() {
        this.props.getUserProfile();
    }

    render() {
        const { profile, courses, locations } = this.props;

        if (!(profile && courses.all && locations.all)) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        return (
            <MainContentWrap>
              <NextAppointment profile={profile} />
              <UpdateProfileForm profile={profile}
                                 locations={locations}
                                 courses={courses} />
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.scheduling.profile,
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
    getUserProfile,
    getLocations,
    getCourses,
})(Profile);
