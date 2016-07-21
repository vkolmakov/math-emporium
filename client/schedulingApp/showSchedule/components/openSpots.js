import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Router, Link } from 'react-router';
import moment from 'moment';

import { getOpenSpots, resetOpenSpots, scheduleAppointment } from '../actions';
import { TIME_OPTIONS, BASE_PATH, TIMESTAMP_DISPLAY_FORMAT } from '../../constants';

import LoadingSpinner from '../../../components/loadingSpinner';
import Modal from 'react-modal';

class OpenSpots extends Component {
    constructor() {
        super();
        this.OPEN_SPOTS_PAGE_URL = `/${BASE_PATH}/show/#`;
        this.PROFILE_PAGE_URL = `/${BASE_PATH}/profile/`;
        this.state = {
            displayProfileModal: false,
            displayScheduleModal: false,
            displaySuccessModal: false,
            displayFailureModal: false,
            error: null,
            appointmentInfo: null,
        };
    }

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

    handleExpired() {
        return () => {
            // TODO: Display a little tooltip on click
            console.log('this one is expired :(');
        };
    }

    handleClosed() {
        return () => {
            // TODO: Display a little tooltip on click
            console.log('this one is closed :(');
        };
    }

    handleOpen(time) {
        return () => {
            const { location, course, profile } = this.props;
            const appointmentInfo = {
                location,
                course,
                time,
            };

            const isCompleteProfile = !!(profile.firstName && profile.lastName);
            if (isCompleteProfile) {
                this.setState({
                    appointmentInfo,
                    displayProfileModal: false,
                    displayScheduleModal: true,
                });
            } else {
                this.setState({
                    appointmentInfo,
                    displayProfileModal: false,
                    displayScheduleModal: true,
                });
            }
        };
    }

    renderOpenSpot(openSpot) {
        const displayTime = TIME_OPTIONS.find(
            ({ value, display }) => value === openSpot.time).display;

        const count = openSpot.count;

        // Add an ((ISO weekday number of a current spot) - 1)
        // to the start date (which has an ISO date of 1)
        // to get the actual weekday and just add a number of minutes
        // that is stored in time as a num of minutes after midnight
        const openSpotTime = moment(this.props.startDate)
                  .add(openSpot.weekday - 1, 'days')
                  .add(openSpot.time, 'minutes');

        const isExpired = moment().isAfter(openSpotTime);

        let displayCount;
        let displayClass;
        let onClick;

        if (isExpired) {
            displayCount = count > 0 ? `${count} available` : 'none available';
            displayClass = 'expired-spot';
            onClick = this.handleExpired();
        } else if (count > 0) {
            // not expired and have some spots
            displayCount = `${count} available`;
            displayClass = 'open-spot';
            onClick = this.handleOpen(openSpotTime);
        } else {
            // not expired and has no spots
            displayCount = 'none available';
            displayClass = 'closed-spot';
            onClick = this.handleClosed();
        }

        return (
            <div key={openSpot.time} className={displayClass}>
              <Link to={this.OPEN_SPOTS_PAGE_URL}
                    onClick={onClick}>{displayTime}: {displayCount}</Link>
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

    renderScheduleModal() {
        if (!this.state.appointmentInfo) {
            return <span></span>;
        }

        const { time, course, location } = this.state.appointmentInfo;

        const displayTime = time.format(TIMESTAMP_DISPLAY_FORMAT);
        const appointmentInfoDisplay = `${course.code} on ${displayTime}`;

        const onRequestClose = _ => (
            this.setState({
                displayScheduleModal: false,
                displayProfileModal: false,
                appointmentInfo: null,
            })
        );

        const scheduleAppointment = e => {
            e.preventDefault();
            this.props.scheduleAppointment({ location, course, time })
            // TODO: Add better appointment scheduling handling
                .then(this.context.router.push(this.PROFILE_PAGE_URL));
        };

        return (
            <Modal isOpen={this.state.displayScheduleModal}
                   onRequestClose={onRequestClose}
                   className="confirmation-modal">
              <h2>Confirm your appointment details</h2>
              <h2>{appointmentInfoDisplay}</h2>
              <div className="buttons">
                <Link to={this.OPEN_SPOTS_PAGE_URL}
                      onClick={scheduleAppointment}
                      className="nondestructive action">Schedule</Link>
                <Link to={this.OPEN_SPOTS_PAGE_URL}
                      onClick={onRequestClose}
                      className="destructive nonaction">Cancel</Link>
              </div>
            </Modal>
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
            return (
                <LoadingSpinner />
            );
        }

        return (
            <div>
              {this.renderScheduleModal()}
              <div className="open-spots-display">
                {this.renderOpenSpots()}
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        openSpots: state.scheduling.showSchedule.openSpots,
        profile: state.scheduling.profile,
    };
}

OpenSpots.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, {
    getOpenSpots,
    resetOpenSpots,
    scheduleAppointment,
})(OpenSpots);
