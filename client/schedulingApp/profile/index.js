import React, { Component } from "react";
import { connect } from "react-redux";

import Appointments from "./components/appointments";
import UpdateProfileForm from "./components/updateProfileForm";
import Faq from "./components/faq";
import LoadingSpinner from "../../components/loadingSpinner";

import { getUserProfile, getActiveUserAppointments } from "./actions";
import { getFaqContent } from "../../util/actions";

class Profile extends Component {
    componentDidMount() {
        // always fetch new active appointments
        this.props.getActiveUserAppointments();

        if (typeof this.props.faqContent === "undefined") {
            this.props.getFaqContent();
        }
    }

    render() {
        const {
            profile,
            courses,
            locations,
            subjects,
            faqContent,
            appointments,
        } = this.props;

        const isInitialized = [
            profile,
            courses.all,
            locations.all,
            typeof faqContent === "string",
            appointments,
        ].every(Boolean);

        if (!isInitialized) {
            return (
                <div className="profile-and-appointments-loading">
                    <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="profile-and-appointments">
                <div className="appointments-faq">
                    <Appointments
                        courses={courses.all}
                        locations={locations.all}
                        appointments={appointments}
                    />
                    <Faq content={faqContent} />
                </div>

                <div className="profile">
                    <UpdateProfileForm
                        profile={profile}
                        locations={locations}
                        courses={courses}
                        subjects={subjects}
                    />
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
        faqContent: state.util.settings.faqContent,
        appointments: state.scheduling.profile.activeUserAppointments,
    };
}

export default connect(
    mapStateToProps,
    {
        getUserProfile,
        getActiveUserAppointments,
        getFaqContent,
    }
)(Profile);
