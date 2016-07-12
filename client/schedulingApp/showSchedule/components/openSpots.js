import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';

import { getOpenSpots } from '../actions';
import { TIME_OPTIONS, BASE_PATH } from '../../constants';

class OpenSpots extends Component {
    componentDidUpdate(prevProps) {
        const { location, course, startDate, openSpots: currOpenSpots } = this.props;
        const prevOpenSpots = prevProps.openSpots;

        if ([location, course, startDate].every(e => !!e) && currOpenSpots.length === 0) {
            // TODO: Handle edge-case where there are no schedules defined
            this.props.getOpenSpots(location, course, startDate);
        }
    }

    renderOpenSpot(openSpot) {
        const displayTime = TIME_OPTIONS.find(
            ({ value, display }) => value === openSpot.time).display;

        const count = openSpot.count;
        const [displayCount, displayClass] =
                  count > 0 ? [`${count} avaiable`, 'open-spot'] : ['none available', 'closed-spot'];

        // TODO: add an onClick to the link to save the selected appointment in the state
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
                  {d.weekdayDisplay}
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

        return (
            <div className="open-spots-display">
              {this.renderOpenSpots()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        openSpots: state.showSchedule.openSpots,
    }
}

export default connect(mapStateToProps, { getOpenSpots })(OpenSpots);
