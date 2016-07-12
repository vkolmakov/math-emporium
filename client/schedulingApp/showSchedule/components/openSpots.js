import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOpenSpots } from '../actions';

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
        return (
            <div>
              {openSpot.time} {openSpot.count}
            </div>
        );
    }

    partitionOpenSpotsByWeekday(openSpots) {
        // put every open-spot that have the same week in one list under one key
        const openSpotsByWeekdayObj = openSpots.reduce((result, os) => {
            if (!result[os.weekday]) {
                result[os.weekday] = [];
            }
            result[os.weekday] = result[os.weekday].concat([os]);
            return result;
        }, {});

        // convert this object into a list
        return Object.keys(openSpotsByWeekdayObj).sort().map(weekday => openSpotsByWeekdayObj[weekday]);
    }

    renderOpenSpots() {
        const openSpots = this.partitionOpenSpotsByWeekday(this.props.openSpots);

        return (
            openSpots.map(d => (
                <div className="weekday">
                  {d.map(d => this.renderOpenSpot(d))}
                </div>
            ))
        )
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
            <div className="middle-help-message-wrap">
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
