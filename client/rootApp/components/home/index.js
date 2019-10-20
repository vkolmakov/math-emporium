import React, { Component } from "react";
import { connect } from "react-redux";

import CourseSelectionAutocomplete from "./courseSelectionAutocomplete";

import MainContentWrap from "@client/components/mainContentWrap";
import LocationsInfo from "@client/components/locationsInfo";
import withRouterContext from "@client/routing/withRouterContext";

import {
    getLocations,
    getCourses,
    getSubjects,
} from "@client/sharedPublicData/actions";
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

class Home extends Component {
    constructor() {
        super();

        this.state = {
            isCourseAutocompleteInputFocused: false,
            isBackgroundTransitionAnimationEnabled: false,
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
                this.props.courses.all.length > 0
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

            return (
                <MainContentWrap>
                    <div className="home-autocomplete">
                        <div
                            className={`home-autocomplete__background-image
                                ${
                                    this.state.isCourseAutocompleteInputFocused
                                        ? ""
                                        : " home-autocomplete__background-image--without-blur-on-background-image"
                                } ${
                                this.state
                                    .isBackgroundTransitionAnimationEnabled
                                    ? " home-autocomplete__background-image--with-background-transition-animation"
                                    : ""
                            }`}
                            style={withBackgroundImage()}>
                            <div className="home-autocomplete__background-image-overlay" />
                        </div>

                        <div className="home-autocomplete__content-container">
                            <h1 className="home-autocomplete__header-title">
                                {this.props.applicationTitle}
                            </h1>
                            <h2 className="home-autocomplete__header-subtitle">
                                Select your course to see our schedule
                            </h2>
                            <CourseSelectionAutocomplete
                                courses={this.props.courses.all}
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
                                onAfterInitialFocus={() => {
                                    setTimeout(() => {
                                        this.setState({
                                            isBackgroundTransitionAnimationEnabled: true,
                                        });
                                    }, 0);
                                }}
                            />
                        </div>
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
        isSimplifiedSchedulingUxEnabled:
            state.util.isSimplifiedSchedulingUxEnabled,
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
    }
)(withRouterContext(Home));
