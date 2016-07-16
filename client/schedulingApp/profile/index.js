import React, { Component } from 'react';
import { connect } from 'react-redux';

import NextAppointment from './components/nextAppointment';
import UpdateProfileForm from './components/updateProfileForm';
import LoadingSpinner from '../../components/loadingSpinner';

import { getUserProfile } from './actions';
import { getLocations, getCourses } from '../showSchedule/actions';

class Profile extends Component {
    componentWillMount() {
        this.props.getUserProfile();
        this.props.getLocations();
        this.props.getCourses();
    }

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
        profile: state.profile,
        locations: {
            all: state.showSchedule.locations.all,
        },
        courses: {
            all: state.showSchedule.courses.all,
        },
    };
}

export default connect(mapStateToProps, {
    getUserProfile,
    getLocations,
    getCourses,
})(Profile);
