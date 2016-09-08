import React, { Component } from 'react';
import TimerMixin from 'react-timer-mixin';
import { connect } from 'react-redux';
import { Router, Link } from 'react-router';
import moment from 'moment';
import reactMixin from 'react-mixin';

import { getOpenSpots,
         resetOpenSpots,
         scheduleAppointment,
         clearSchedulingMessage,
         getAvailableTutors,
         schedulingMessage } from '../actions';

import { setLocation, setCourse } from '../../actions';

import { TIME_OPTIONS, BASE_PATH, TIMESTAMP_DISPLAY_FORMAT, RANDOM_TUTOR } from '../../constants';

import UpdateProfileForm from '../../profile/components/updateProfileForm';
import LoadingSpinner from '../../../components/loadingSpinner';
import Modal from 'react-modal';
import Select from '../../../components/select/reactSelectWrapper';

class OpenSpots extends Component {
    constructor() {
        super();
        this.OPEN_SPOTS_PAGE_URL = `/${BASE_PATH}/show/#`;
        this.PROFILE_PAGE_URL = `/${BASE_PATH}/profile/`;
        this.state = {
            displayProfileModal: false,
            displayScheduleModal: false,
            displayLoadingModal: false,
            appointmentInfo: null,
            forceLoadingSpinner: false,
        };
    }

    componentWillMount() {
        const { location, startDate, course } = this.props;
        if (location && startDate && course) {
            this.props.resetOpenSpots();
            this.props.getOpenSpots({ location, course, startDate });
        }
    }

    componentDidUpdate(prevProps) {
        const { location, course, startDate } = this.props;
        const isEverythingSelected = [location, course, startDate].every(e => !!e);
        const isRerenderWithNewCourse = prevProps.course && course && prevProps.course.id !== course.id || !prevProps.course;
        const isRerenderWithNewDate = prevProps.startDate && startDate && prevProps.startDate !== startDate;

        if (isEverythingSelected && (isRerenderWithNewCourse || isRerenderWithNewDate)) {
            this.props.getOpenSpots({ location, course, startDate });
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
        return (event) => {
            event.preventDefault();
            const { location, course, profile } = this.props;
            const appointmentInfo = {
                location,
                course,
                time,
            };

            if (!this.props.authenticated) {
                this.context.router.push('/signin');
            } else {
                const isCompleteProfile = !!(profile) && !!(profile.firstName && profile.lastName);

                if (isCompleteProfile) {
                    this.setState({ displayLoadingModal: true });
                    this.props.getAvailableTutors({ time, course, location }).then(response => {
                        const availableTutors = response.data;

                        if (availableTutors.length < 1) {
                            throw new Error('There are no tutor available');
                        }

                        if (availableTutors.length > 1) {
                            availableTutors.unshift(RANDOM_TUTOR);
                        }

                        this.setState({
                            appointmentInfo: {
                                availableTutors,
                                requestedTutor: availableTutors.length > 1 ? RANDOM_TUTOR : availableTutors[0],
                                ...appointmentInfo,
                            },
                            displayProfileModal: false,
                            displayLoadingModal: false,
                            displayScheduleModal: true,
                        });
                    })
                    .catch(error => {
                        this.props.schedulingMessage(error.error || error.toString());
                    });
                } else {
                    this.setState({
                        appointmentInfo,
                        displayProfileModal: true,
                        displayScheduleModal: false,
                    });
                }
            }
        };
    }

    renderOpenSpot(openSpot) {
        const count = openSpot.count;

        // Add an ((ISO weekday number of a current spot) - 1)
        // to the start date (which has an ISO date of 1)
        // to get the actual weekday and just add a number of minutes
        // that is stored in time as a num of minutes after midnight
        const openSpotTime = moment(this.props.startDate)
                  .add(openSpot.weekday - 1, 'days')
                  .add(openSpot.time, 'minutes');

        const displayTime = openSpotTime.format('hh:mm a');
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
            openSpots: openSpotsByWeekdayObj[weekday].sort((os1, os2) => os1.time - os2.time),
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
        if (!this.state.appointmentInfo || !this.state.displayScheduleModal) {
            return <span></span>;
        }

        const { time, course, location, availableTutors } = this.state.appointmentInfo;

        const displayTime = time.format(TIMESTAMP_DISPLAY_FORMAT);
        const appointmentInfoDisplay = `${course.code} on ${displayTime}`;

        const onRequestClose = _ => (
            this.setState({
                displayScheduleModal: false,
                displayProfileModal: false,
                displayLoadingModal: false,
            })
        );

        const scheduleAppointment = e => {
            e.preventDefault();
            this.setState({
                displayScheduleModal: false,
                displayLoadingModal: true,
            });

            const { requestedTutor, additionalComments } = this.state.appointmentInfo;

            this.props.scheduleAppointment({ location, course, time, requestedTutor, additionalComments })
                .then(_ => {
                    onRequestClose();
                });
        };

        const selectTutor = tutorOption => {
            const { appointmentInfo } = this.state;
            this.setState({
                appointmentInfo: {
                    ...appointmentInfo,
                    requestedTutor: appointmentInfo.availableTutors.find(t => t.id === tutorOption.value),
                },
            });
        };

        const updateAdditionalComments = e => {
            const additionalComments = e.target.value;
            const appointmentInfo = this.state.appointmentInfo;
            this.setState({
                appointmentInfo: {
                    ...appointmentInfo,
                    additionalComments,
                },
            });
        };

        const tutorOptions = availableTutors.map(t => ({ label: t.name, value: t.id }));

        return (
            <Modal isOpen={this.state.displayScheduleModal}
                   onRequestClose={onRequestClose}
                   className="scheduling-modal">
              <h2>Confirm your appointment details</h2>
              <h2>{appointmentInfoDisplay}</h2>
              <div className="controls-wrapper">
                  <h2>Select a tutor:</h2>
                  <Select options={tutorOptions}
                        value={this.state.appointmentInfo.requestedTutor.id}
                        clearable={false}
                        onChange={selectTutor}
                        placeholder="Select a tutor..."/>
                  <textarea value={this.state.appointmentInfo.additionalComments}
                            onChange={updateAdditionalComments}
                            placeholder="Additional comments..."/>
              </div>

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

    renderProfileModal() {
        const onRequestClose = _ => {
            const { appointmentInfo } = this.state;
            this.setState({
                forceLoadingSpinner: true,
            });
            this.timeout = setTimeout(() => {
                // hacking my way through again
                this.setState({
                    displayScheduleModal: false,
                    displayProfileModal: false,
                    appointmentInfo,
                    forceLoadingSpinner: false,
                });
                this.props.setLocation(appointmentInfo.location);
                this.props.setCourse(appointmentInfo.course);
                this.props.getOpenSpots({ ...appointmentInfo, startDate: this.props.startDate });
                this.timeout = null;
            }, 1500);
        };

        let profile = this.props.profile;
        if (!profile) {
            profile = {};
        }

        return (
            <Modal isOpen={this.state.displayProfileModal}
                   onRequestClose={onRequestClose}
                   className="profile-form-modal">
              <h2>Before we start scheduling appointments we need some more info about you...</h2>
              <UpdateProfileForm profile={profile}
                                 locations={this.props.locations}
                                 courses={this.props.courses}
                                 submitCallback={onRequestClose}/>
            </Modal>
        );
    }

    renderLoadingModal() {
        const onRequestClose = () => {
            this.setState({
                displayScheduleModal: false,
                displayLoadingModal: false,
            });
        };

        return (
            <Modal isOpen={this.state.displayLoadingModal}
                   onRequestClose={onRequestClose}
                   className="confirmation-modal">
              <LoadingSpinner />
            </Modal>
        );
    }

    renderMessageModal(message) {
        if (!message) {
            return <span></span>;
        }

        const onRequestClose = _ => {
            const { appointmentInfo } = this.state;

            this.props.getOpenSpots({ ...appointmentInfo, startDate: this.props.startDate });

            this.setState({
                displayProfileModal: false,
                displayScheduleModal: false,
                appointmentInfo,
            });

            this.props.clearSchedulingMessage();
        };

        return (
            <Modal isOpen={!!message}
                   onRequestClose={onRequestClose}
                   className="confirmation-modal">
              <h2 className="message">{message}</h2>
              <div className="buttons">
                <Link to={this.OPEN_SPOTS_PAGE_URL}
                      onClick={onRequestClose}
                      className="nondestructive nonaction">Close</Link>
              </div>
            </Modal>
        );
    }

    render() {
        if (this.state.forceLoadingSpinner) {
            return (
                <LoadingSpinner />
            );
        }

        const { location, course, startDate, message } = this.props;

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

        const isWaitingOnOpenSpots = this.props.openSpots && this.props.openSpots.length == 0;
        if (isWaitingOnOpenSpots) {
            return (
                <LoadingSpinner />
            );
        }

        return (
            <div>
              {this.renderScheduleModal()}
              {this.renderMessageModal(message)}
              {this.renderProfileModal()}
              {this.renderLoadingModal()}
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
        message: state.scheduling.showSchedule.message,
        profile: state.scheduling.profile,
        locations: state.scheduling.shared.locations,
        courses: state.scheduling.shared.courses,
        authenticated: state.auth.authenticated,
    };
}


reactMixin(OpenSpots.prototype, TimerMixin);

OpenSpots.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, {
    getOpenSpots,
    resetOpenSpots,
    scheduleAppointment,
    clearSchedulingMessage,
    setLocation,
    setCourse,
    getAvailableTutors,
    schedulingMessage,
})(OpenSpots);
