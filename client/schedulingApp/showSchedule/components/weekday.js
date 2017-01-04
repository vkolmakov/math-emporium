import React from 'react';
import moment from 'moment';

const SingleOpenSpot = ({ startDate, openSpot, now, handlers }) => {
    const count = openSpot.count;

    // Add an ((ISO weekday number of a current spot) - 1)
    // to the start date (which has an ISO date of 1)
    // to get the actual weekday and just add a number of minutes
    // that is stored in time as a num of minutes after midnight
    const openSpotTime = moment(startDate)
              .add(openSpot.weekday - 1, 'days')
              .add(openSpot.time, 'minutes');


    const isExpired = now.isAfter(openSpotTime);
    const isAvailable = count > 0;

    const openSpotText = `${openSpotTime.format('hh:mm a')}: ${isAvailable ? `${count} available` : 'none available'}`;
    const [openSpotClass, openSpotHandler] =
        isExpired
            ? ['expired-spot', handlers.expired]
            : isAvailable ? ['open-spot', handlers.available] : ['closed-spot', handlers.closed];

    return (
        <div className={openSpotClass}>
            <span onClick={openSpotHandler(openSpotTime)}>{openSpotText}</span>
        </div>
    );
};

export default ({ startDate, weekdayDisplay, openSpots, now, handlers }) => (
    <div className="weekday">
        <p>{weekdayDisplay}</p>
        {openSpots.map(os => <SingleOpenSpot startDate={startDate} openSpot={os} now={now} key={os.time} handlers={handlers} />)}
    </div>
);
