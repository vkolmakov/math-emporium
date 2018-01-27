import React from 'react';
import moment from 'moment';

function createAvailableOpenSpotContext(time, count, handlers) {
    return {
        openSpotText: `${time.format('hh:mm a')}: ${count} available`,
        openSpotClass: 'open-spot',
        openSpotHandler: handlers.available,
    };
}

function createUnavailableOpenSpotContext(time, count, handlers) {
    return {
        openSpotText: `${time.format('hh:mm a')}: none available`,
        openSpotClass: 'closed-spot',
        openSpotHandler: handlers.closed,
    };
}

function createExpiredOpenSpotContext(time, count, handlers) {
    return {
        openSpotText: `${time.format('hh:mm a')}: expired`,
        openSpotClass: 'expired-spot',
        openSpotHandler: handlers.expired,
    };
}

const SingleOpenSpot = ({ startDate, openSpot, now, handlers, weekdayDisplay, id }) => {
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

    const { openSpotText, openSpotClass, openSpotHandler } = isExpired
          ? createExpiredOpenSpotContext(openSpotTime, count, handlers)
          : isAvailable
              ? createAvailableOpenSpotContext(openSpotTime, count, handlers)
              : createUnavailableOpenSpotContext(openSpotTime, count, handlers);

    const isInactive = isExpired || !isAvailable;

    return (
        <button className={openSpotClass}
                id={id}
                onClick={openSpotHandler(openSpotTime)}
                aria-label={`${openSpotText}, ${weekdayDisplay}`}
                aria-hidden={isInactive}
                disabled={isInactive}>
            {openSpotText}
        </button>);
};

const openSpotId = (os) => `os_${os.weekday}_${os.time}`;

export default ({ startDate, weekdayDisplay, openSpots, now, handlers }) => (
    <div className="weekday">
        <p>{weekdayDisplay}</p>
        {openSpots.map(
            os => <SingleOpenSpot
                          startDate={startDate}
                          openSpot={os}
                          now={now}
                          id={openSpotId(os)}
                          key={openSpotId(os)}
                          handlers={handlers}
                          weekdayDisplay={weekdayDisplay}/>)}
    </div>
);
