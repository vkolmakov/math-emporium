import React, { Component } from 'react';
import { connect } from 'react-redux';

import Appointments from './components/appointments';
import UpdateProfileForm from './components/updateProfileForm';
import Faq from './components/faq';
import LoadingSpinner from '../../components/loadingSpinner';

import { getUserProfile, getActiveUserAppointments } from './actions';

class Profile extends Component {
    componentDidMount() {
        this.props.getUserProfile();
        this.props.getActiveUserAppointments();
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
            <div className="profile-and-appointments">
              <div className="appointments-faq">
                <Appointments profile={profile} />
                <Faq></Faq>
              </div>

              <div className="profile">
                <UpdateProfileForm profile={profile}
                                   locations={locations}
                                   courses={courses}
                                   subjects={subjects} />
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.scheduling.profile.user,
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
    getActiveUserAppointments,
})(Profile);
