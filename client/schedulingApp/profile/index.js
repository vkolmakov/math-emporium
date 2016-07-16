import React, { Component } from 'react';
import { connect } from 'react-redux';

import NextAppointment from './components/nextAppointment';
import UpdateProfileForm from './components/updateProfileForm';
import LoadingSpinner from '../../components/loadingSpinner';

import { getUserProfile } from './actions';
import { getLocations, getCourses } from '../actions';

class Profile extends Component {
    render() {
        const { profile, courses, locations } = this.props;

        if (!(profile && courses.all && locations.all)) {
            return <LoadingSpinner />;
        }

        return (
            <div className="content">
              <NextAppointment />
              <UpdateProfileForm profile={profile}
                                 locations={locations}
                                 courses={courses} />
            </div>
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
