import React from 'react';
import moment from 'moment';

import LoadingSpinner from '../../../components/loadingSpinner';
import ErrorMessage from './errorMessage';
import Weekday from './weekday';

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
    return Object.keys(openSpotsByWeekdayObj).sort().map(weekday => ({
        openSpots: openSpotsByWeekdayObj[weekday].sort((os1, os2) => os1.time - os2.time),
        // a hack here, we assume that startDate is monday
        weekdayDisplay: moment(startDate).add(weekday - 1, 'days').format('ddd, MM/DD'),
    }));
}

export default ({ openSpots, startDate, isLocationSelected, isCourseSelected, now, handlers }) => {
    if (!isLocationSelected) {
        return (<ErrorMessage message='Select a Location' />);
    }

    if (!isCourseSelected) {
        return (<ErrorMessage message='Select a Course' />);
    }

    if (openSpots.length === 0) {
        return (<LoadingSpinner />);
    }

    const renderWeekday = ({ weekdayDisplay, openSpots }) => (
        <Weekday startDate={startDate}
                 weekdayDisplay={weekdayDisplay}
                 openSpots={openSpots}
                 now={now}
                 handlers={handlers}
                 key={weekdayDisplay} />
    );

    return (
        <div className="open-spots-display">
            {partitionOpenSpotsByWeekday(openSpots, startDate).map(renderWeekday)}
        </div>
    );
};
