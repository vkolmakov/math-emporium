import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';

import { getOpenSpots, resetOpenSpots } from '../actions';
import { TIME_OPTIONS, BASE_PATH } from '../../constants';

import LoadingSpinner from '../../../components/loadingSpinner';

class OpenSpots extends Component {
    componentWillMount() {
        const { location, startDate, course } = this.props;
        if (location && startDate && course) {
            this.props.resetOpenSpots();
            this.props.getOpenSpots(location, course, startDate);
        }
    }

    componentDidUpdate(prevProps) {
        const { location, course, startDate, openSpots: currOpenSpots } = this.props;

        const isEverythingSelected = [location, course, startDate].every(e => !!e);
        const isFirstRender = currOpenSpots.length === 0;
        const isRerenderWithNewCourse = prevProps.course && course && prevProps.course.id !== course.id || !prevProps.course;

        if (isEverythingSelected && (isFirstRender || isRerenderWithNewCourse)) {
            this.props.getOpenSpots(location, course, startDate);
        }
    }

    renderOpenSpot(openSpot) {
        const displayTime = TIME_OPTIONS.find(
            ({ value, display }) => value === openSpot.time).display;

        const count = openSpot.count;

        const isExpired =
                  moment().isAfter(
                      // Add an ((ISO weekday number of a current spot) - 1)
                      // to the start date (which has an ISO date of 1)
                      // to get the actual weekday and just add a number of minutes
                      // that is stored in time as a num of minutes after midnight
                      moment(this.props.startDate).add(openSpot.weekday - 1, 'days').add(openSpot.time, 'minutes')
                  );

        let displayCount;
        let displayClass;

        // TODO: add appropriate onClick events

        if (isExpired) {
            displayCount = count > 0 ? `${count} available` : 'none available';
            displayClass = 'expired-spot';
        } else if (count > 0) {
            // not expired and have some spots
            displayCount = `${count} available`;
            displayClass = 'open-spot';
        } else {
            // not expired and has no spots
            displayCount = 'none available';
            displayClass = 'closed-spot';
        }

        return (
            <div key={openSpot.time} className={displayClass}>
              <Link to={`/${BASE_PATH}/#`}>{displayTime}: {displayCount}</Link>
            </div>
        );
    }

    partitionOpenSpotsByWeekday(openSpots) {
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
            openSpots: openSpotsByWeekdayObj[weekday],
            // a hack here, we assume that startDate is monday
            weekdayDisplay: moment(this.props.startDate).add(weekday - 1, 'days').format('ddd, MM/DD'),
        }));
    }

    renderOpenSpots() {
        const openSpots = this.partitionOpenSpotsByWeekday(this.props.openSpots);

        return (
            openSpots.map(d => (
                <div className="weekday" key={d.weekdayDisplay}>
                  <p>{d.weekdayDisplay}</p>
                  {d.openSpots.map(os => this.renderOpenSpot(os))}
                </div>
            ))
        );
    }

    render() {
        const { location, course, startDate } = this.props;

        let errorMessage;

        if (!startDate) {
            errorMessage = 'Select a location';
        } else if (!location) {
            errorMessage = 'Select a location';
        } else if (!course) {
            errorMessage = 'Select a course';
        }

        if (errorMessage) {
            return (
                <div className="middle-help-message-wrap">
                  <h1>{errorMessage}</h1>
                </div>
            );
        }

        if (this.props.openSpots && this.props.openSpots.length == 0) {
            return <LoadingSpinner />;
        }

        return (
            <div className="open-spots-display">
              {this.renderOpenSpots()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        openSpots: state.scheduling.showSchedule.openSpots,
    };
}

export default connect(mapStateToProps, { getOpenSpots, resetOpenSpots })(OpenSpots);
