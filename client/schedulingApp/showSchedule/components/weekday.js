import React from 'react';
import moment from 'moment';

const SingleOpenSpot = ({ startDate, openSpot }) => {
    const count = openSpot.count;

    // Add an ((ISO weekday number of a current spot) - 1)
    // to the start date (which has an ISO date of 1)
    // to get the actual weekday and just add a number of minutes
    // that is stored in time as a num of minutes after midnight
    const openSpotTime = moment(startDate)
              .add(openSpot.weekday - 1, 'days')
              .add(openSpot.time, 'minutes');


    const isExpired = moment().isAfter(openSpotTime);
    const isAvailable = count > 0;

    const openSpotText = `${openSpotTime.format('hh:mm a')}: ${isAvailable ? `${count} available` : 'none available'}`;
    const openSpotClass =
        isExpired
            ? 'expired-spot'
            : isAvailable ? 'open-spot' : 'closed-spot';

    return (
        <div className={openSpotClass}>
            <span>{openSpotText}</span>
        </div>
    );
};

export default ({ startDate, weekdayDisplay, openSpots }) => (
    <div className="weekday" key={weekdayDisplay}>
        <p>{weekdayDisplay}</p>
        {openSpots.map(os => <SingleOpenSpot startDate={startDate} openSpot={os} key={os.time} />)}
    </div>
);
