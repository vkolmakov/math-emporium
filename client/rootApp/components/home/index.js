import React, { Component } from "react";
import { connect } from "react-redux";

import CourseSelectionAutocomplete from "./courseSelectionAutocomplete";

import MainContentWrap from "@client/components/mainContentWrap";
import LocationsInfo from "@client/components/locationsInfo";
import withRouterContext from "@client/routing/withRouterContext";

import { getLocations, getCourses } from "@client/sharedPublicData/actions";
import { setLocation } from "@client/schedulingApp/actions";
import {
    redirectTo,
    backgroundPictureStyle,
    backgroundPictureOverlayStyle,
} from "@client/utils";

class Home extends Component {
    componentDidMount() {
        if (!this.props.locations.all.length > 0) {
            this.props.getLocations();
        }

        if (!this.props.locations.all.length > 0) {
            this.props.getCourses();
        }
    }

    redirectToSchedule() {
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

        const HomeHeader = ({ children }) => (
            <div
                className="home-header"
                style={
                    this.props.headerPictureLink
                        ? backgroundPictureStyle(this.props.headerPictureLink)
                        : {}
                }>
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
            return (
                <MainContentWrap>
                    <div className="home-content-container">
                        <div
                            className="home__course-autocomplete-container"
                            key="leading-element">
                            <h1 className="home-header-title">
                                {this.props.applicationTitle}
                            </h1>
                            <h2>Select your course to see our schedule</h2>
                            <CourseSelectionAutocomplete
                                courses={this.props.courses.all}
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
        courses: {
            all: state.sharedPublicData.courses.all,
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
        setLocation,
        getCourses,
    }
)(withRouterContext(Home));
