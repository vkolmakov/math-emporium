import React, { Component } from 'react';
import { connect } from 'react-redux';

import NextAppointment from './components/nextAppointment';
import UpdateProfileForm from './components/updateProfileForm';
import LoadingSpinner from '../../components/loadingSpinner';

import { getUserProfile } from './actions';

class Profile extends Component {
    componentDidMount() {
        this.props.getUserProfile();
    }

    render() {
        const { profile, courses, locations, subjects } = this.props;

        if (!(profile && courses.all && locations.all)) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="content">
                <NextAppointment profile={profile} />
                <UpdateProfileForm profile={profile}
                                   locations={locations}
                                   courses={courses}
                                   subjects={subjects} />
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
        subjects: {
            all: state.scheduling.shared.subjects.all,
            selected: state.scheduling.shared.subjects.selected,
        },
    };
}

export default connect(mapStateToProps, {
    getUserProfile,
})(Profile);
