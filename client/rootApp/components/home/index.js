import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "@client/components/Modal";

import CourseSelectionAutocomplete from "./courseSelectionAutocomplete";

import MainContentWrap from "@client/components/mainContentWrap";
import LocationsInfo from "@client/components/locationsInfo";
import withRouterContext from "@client/routing/withRouterContext";

import {
    getLocations,
    getCourses,
    getSubjects,
} from "@client/sharedPublicData/actions";
import { getRecentUserAppointments } from "@client/schedulingApp/profile/actions";
import {
    setLocation,
    setSubject,
    setCourse,
} from "@client/schedulingApp/actions";
import {
    redirectTo,
    backgroundPictureStyle,
    backgroundPictureOverlayStyle,
} from "@client/utils";

function RecentUserAppointments({
    recentUserAppointments,
    courses,
    onAppointmentClick,
}) {
    const relevantCourseIds = new Set(
        recentUserAppointments.map((appointment) => appointment.courseId)
    );
    const coursesWithAppointments = courses.filter((course) =>
        relevantCourseIds.has(course.id)
    );
    const onAppointmentLinkClick = (course) => (event) => {
        event.preventDefault();
        onAppointmentClick(course);
    };

    const RecentUserAppointment = function RecentUserAppointment(course) {
        return (
            <li className="recent-user-appointments__appointment-container">
                <button
                    className="recent-user-appointments__appointment-button"
                    onClick={onAppointmentLinkClick(course)}>
                    <div className="recent-user-appointments__course-code">
                        {course.code}
                    </div>
                    <div className="recent-user-appointments__course-name">
                        {course.name}
                    </div>
                </button>
            </li>
        );
    };
    return (
        <ul className="recent-user-appointments__list">
            {coursesWithAppointments.map(RecentUserAppointment)}
        </ul>
    );
}

class Home extends Component {
    constructor() {
        super();

        this.state = {
            isCourseAutocompleteInputFocused: false,
        };
    }

    componentDidMount() {
        if (!this.props.locations.all.length > 0) {
            this.props.getLocations();
        }

        if (!this.props.courses.all.length > 0) {
            this.props.getCourses();
        }

        if (!this.props.subjects.all.length > 0) {
            this.props.getSubjects();
        }

        this.props.getRecentUserAppointments({
            isUserLoggedIn: this.props.isUserLoggedIn,
        });
    }

    redirectToSchedule() {
        redirectTo(this.props.history, "/schedule");
    }

    onCourseSelection(course) {
        this.props.setLocation(course.location);
        this.props.setSubject(course.subject);
        this.props.setCourse(course);
        redirectTo(this.props.history, "/schedule");
    }

    render() {
        if (
            !(
                this.props.locations.all.length > 0 &&
                this.props.courses.all.length > 0 &&
                Array.isArray(this.props.recentUserAppointments)
            )
        ) {
            // not ready to render yet
            return <div />;
        }

        const Locations = () => (
            <div className="locations">
                <LocationsInfo
                    shouldDisplayImageBackground
                    onLocationTitleClick={(location) =>
                        this.props.setLocation(location)
                    }
                    getLocationTitleLink={() => "/schedule"}
                />
            </div>
        );

        const ScheduleButton = () => (
            <button
                onClick={this.redirectToSchedule.bind(this)}
                className="schedule-appointment-button">
                Schedule an appointment
            </button>
        );

        const withBackgroundImage = () => {
            return this.props.headerPictureLink
                ? backgroundPictureStyle(this.props.headerPictureLink)
                : {};
        };

        const HomeHeader = ({ children }) => (
            <div className="home-header" style={withBackgroundImage()}>
                <div
                    className="home-header-overlay"
                    style={
                        this.props.headerPictureLink
                            ? backgroundPictureOverlayStyle()
                            : {}
                    }>
                    <div className="home-header-block">{children}</div>
                </div>
            </div>
        );

        if (this.props.isSimplifiedSchedulingUxEnabled) {
            const locationNameLookup = {};
            for (let course of this.props.courses.all) {
                const location = this.props.locations.all.find(
                    (location) => location.id === course.location.id
                );

                if (location && location.name) {
                    locationNameLookup[course.id] = `at ${location.name}`;
                } else {
                    locationNameLookup[course.id] = " ";
                }
            }

            const recentlyScheduledCourses = this.props.recentUserAppointments
                ? this.props.recentUserAppointments.map(
                      (appointment) => appointment.courseId
                  )
                : [];
            let ResponsiveAutocomplete;

            if (
                !this.props.isDesktop &&
                this.state.isCourseAutocompleteInputFocused
            ) {
                const closeModal = () => {
                    this.setState({
                        isCourseAutocompleteInputFocused: false,
                    });
                };

                const CancelButton = function CancelButton() {
                    return (
                        <button
                            onClick={closeModal}
                            className="home-autocomplete__modal-close-button">
                            Cancel
                        </button>
                    );
                };

                ResponsiveAutocomplete = (
                    <Modal
                        isOpen={true}
                        onRequestClose={closeModal}
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="home-autocomplete__modal-overlay"
                        closeTimeoutMS={1}
                        className="home-autocomplete__modal">
                        <CancelButton />
                        <CourseSelectionAutocomplete
                            theme="in-modal"
                            onRenderComplete={({ textInputRef }) => {
                                if (
                                    textInputRef &&
                                    typeof textInputRef.focus === "function"
                                ) {
                                    textInputRef.focus();
                                }
                            }}
                            courses={this.props.courses.all}
                            recentlyScheduledCourses={recentlyScheduledCourses}
                            coursesSearcher={this.props.courses.searcher}
                            getLocationNameFromCourse={(course) => {
                                return locationNameLookup[course.id];
                            }}
                            onCourseSelection={(course) =>
                                this.onCourseSelection(course)
                            }
                            onFocus={() => {
                                this.setState({
                                    isCourseAutocompleteInputFocused: true,
                                });
                            }}
                            onBlur={() => {
                                this.setState({
                                    isCourseAutocompleteInputFocused: false,
                                });
                            }}
                        />
                    </Modal>
                );
            } else {
                ResponsiveAutocomplete = (
                    <CourseSelectionAutocomplete
                        theme={"standalone"}
                        onRenderComplete={({ textInputRef }) => {
                            if (
                                this.props.isDesktop &&
                                textInputRef &&
                                typeof textInputRef.focus === "function"
                            ) {
                                textInputRef.focus();
                            }
                        }}
                        courses={this.props.courses.all}
                        recentlyScheduledCourses={recentlyScheduledCourses}
                        coursesSearcher={this.props.courses.searcher}
                        getLocationNameFromCourse={(course) => {
                            return locationNameLookup[course.id];
                        }}
                        onCourseSelection={(course) =>
                            this.onCourseSelection(course)
                        }
                        onFocus={() => {
                            this.setState({
                                isCourseAutocompleteInputFocused: true,
                            });
                        }}
                        onBlur={() => {
                            this.setState({
                                isCourseAutocompleteInputFocused: false,
                            });
                        }}
                    />
                );
            }

            let Content;
            if (this.props.recentUserAppointments.length > 0) {
                // Add suggestions based on previous appointments
                Content = (
                    <div className="home-autocomplete__content-container">
                        <div className="home-autocomplete__recent-appointments">
                            <h2 className="home-autocomplete__header-subtitle">
                                Reschedule one of your previous appointments
                            </h2>
                            <RecentUserAppointments
                                recentUserAppointments={
                                    this.props.recentUserAppointments
                                }
                                courses={this.props.courses.all}
                                onAppointmentClick={this.onCourseSelection.bind(
                                    this
                                )}
                            />
                        </div>

                        <h2 className="home-autocomplete__header-subtitle home-autocomplete__header-subtitle--alternative">
                            Or search for your course below
                        </h2>
                        {ResponsiveAutocomplete}
                    </div>
                );
            } else {
                // Just show search
                Content = (
                    <div className="home-autocomplete__content-container">
                        <h2 className="home-autocomplete__header-subtitle home-autocomplete__header-subtitle--alternative">
                            Select your course to see our schedule
                        </h2>
                        {ResponsiveAutocomplete}
                    </div>
                );
            }

            return (
                <MainContentWrap>
                    <div
                        className="home-autocomplete"
                        style={withBackgroundImage()}>
                        {Content}
                    </div>
                </MainContentWrap>
            );
        }

        return (
            <MainContentWrap>
                <div className="home-content-container">
                    <HomeHeader key="leading-element">
                        <h1 className="home-header-title">
                            {this.props.applicationTitle}
                        </h1>
                        <h2>Study with us!</h2>
                        <ScheduleButton />
                    </HomeHeader>

                    <Locations key="locations" />
                </div>
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: { all: state.sharedPublicData.locations.all },
        subjects: { all: state.sharedPublicData.subjects.all },
        courses: {
            all: state.sharedPublicData.courses.all,
            searcher: state.sharedPublicData.courses.searcher,
        },
        headerPictureLink: state.util.settings.applicationMainHomePictureLink,
        applicationTitle: state.util.settings.applicationTitle,
        recentUserAppointments: state.scheduling.profile.recentUserAppointments,
        isSimplifiedSchedulingUxEnabled:
            state.util.isSimplifiedSchedulingUxEnabled,
        isDesktop: state.util.isDesktop,
        isUserLoggedIn: state.auth.authenticated,
    };
}

export default connect(
    mapStateToProps,
    {
        getLocations,
        getSubjects,
        getCourses,
        setLocation,
        setSubject,
        setCourse,
        getRecentUserAppointments,
    }
)(withRouterContext(Home));
