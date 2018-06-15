import React from "react";
import moment from "moment";

import { OPEN_SPOTS_LOADING_MESSAGE } from "../constants";
import { Either, S } from "../../../utils";

import LoadingSpinner from "../../../components/loadingSpinner";
import LocationsInfo from "../../../components/locationsInfo";
import ErrorMessage from "./errorMessage";
import Weekday from "./weekday";
import MissingItemInfo from "./missingItemInfo";

function partitionOpenSpotsByWeekday(openSpots, startDate) {
    // put every open-spot that have the same week in one list under one key
    const openSpotsByWeekdayObj = openSpots.reduce((result, os) => {
        if (!result[os.weekday]) {
            // create an empty list if we see it for the first time
            result[os.weekday] = [];
        }
        // concat selected open spots into an appropriate list
        result[os.weekday] = result[os.weekday].concat([os]);
        return result;
    }, {});

    // convert this object into a list of objects and add weekdayDisplay string
    return Object.keys(openSpotsByWeekdayObj)
        .sort()
        .map((weekday) => ({
            openSpots: openSpotsByWeekdayObj[weekday].sort(
                (os1, os2) => os1.time - os2.time,
            ),
            // a hack here, we assume that startDate is monday
            weekdayDisplay: moment(startDate)
                .add(weekday - 1, "days")
                .format("ddd, MM/DD"),
        }));
}

const OpenSpotsWrapper = (content) => (
    <div
        aria-live="polite"
        aria-relevant="additions"
        className="open-spots-display">
        {content}
    </div>
);

const OpenSpotsMessageWrapper = (content) => (
    <div className="open-spots-message">{content}</div>
);

export default ({
    openSpots,
    startDate,
    isLocationSelected,
    isSubjectSelected,
    isCourseSelected,
    now,
    handlers,
}) => {
    if (!isLocationSelected) {
        return OpenSpotsMessageWrapper([
            <ErrorMessage key="message" message="Select a location" />,
            <LocationsInfo key="suppliment" />,
        ]);
    }

    if (!isSubjectSelected) {
        return OpenSpotsMessageWrapper([
            <ErrorMessage key="message" message="Select a subject" />,
            <MissingItemInfo key="suppliment" missingItem="subject" />,
            <LocationsInfo onlySelected key="location" />,
        ]);
    }

    if (!isCourseSelected) {
        return OpenSpotsMessageWrapper([
            <ErrorMessage key="message" message="Select a course" />,
            <MissingItemInfo key="suppliment" missingItem="course" />,
            <LocationsInfo onlySelected key="location" />,
        ]);
    }

    const renderWeekday = ({ weekdayDisplay, openSpots }) => (
        <Weekday
            startDate={startDate}
            weekdayDisplay={weekdayDisplay}
            openSpots={openSpots}
            now={now}
            handlers={handlers}
            key={weekdayDisplay}
        />
    );

    const renderOpenSpots = (os) =>
        partitionOpenSpotsByWeekday(os, startDate).map(renderWeekday);

    const renderErrorMessage = (msg) =>
        msg === OPEN_SPOTS_LOADING_MESSAGE ? (
            <LoadingSpinner />
        ) : (
            <ErrorMessage message={msg} />
        );

    return Either.either(
        S.compose(
            OpenSpotsMessageWrapper,
            renderErrorMessage,
        ),
        S.compose(
            OpenSpotsWrapper,
            renderOpenSpots,
        ),
        openSpots,
    );
};
