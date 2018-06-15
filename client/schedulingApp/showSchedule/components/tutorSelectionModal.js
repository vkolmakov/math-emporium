import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import FilterControls from '../../../components/filterControls';

import { clearOpenSpotSelection,
         scheduleAppointment,
         displayLoadingModal,
         displayMessageModal } from '../actions';

import { getUserProfile } from '../../profile/actions';

import { signoutUser } from '../../../auth/actions';

import { TIMESTAMP_DISPLAY_FORMAT, RANDOM_TUTOR } from '../../constants';
import { TEST_ID } from '../../../constants';

class TutorSelectionModal extends Component {
    constructor(props) {
        super(props);
        const { selectedOpenSpotInfo } = this.props;

        let tutorOptions = [];

        if (selectedOpenSpotInfo.tutors) {
            tutorOptions = selectedOpenSpotInfo.tutors.length > 1
              ? [RANDOM_TUTOR, ...selectedOpenSpotInfo.tutors]
              : selectedOpenSpotInfo.tutors;
        } else {
            tutorOptions = [];
        }

        this.state = {
            additionalComments: '',
            requestedTutor: tutorOptions.length > 0 ? tutorOptions[0] : null,
            tutors: tutorOptions,
        };
    }

    successMessage({ location, course, time }) {
        return `Your appointment for ${course.code} at ${location.name} on ${time.format(TIMESTAMP_DISPLAY_FORMAT)} was successfully scheduled!`;
    }

    render() {
        const { selectedOpenSpotInfo } = this.props;
        const { course, subject, location, time } = selectedOpenSpotInfo;

        const getTutorOptions = (state) => state.tutors.map(t => ({ label: t.name, value: t.id }));

        const getAppointmentInfoDisplay = (openSpotInfo) => {
            const displayTime = openSpotInfo.time.format(TIMESTAMP_DISPLAY_FORMAT);
            const appointmentInfoDisplay = `${openSpotInfo.course.code} on ${displayTime}`;

            return appointmentInfoDisplay;
        };

        const onTutorSelect = tutorOption => this.setState((state, _) => {
            return { ...state, requestedTutor: state.tutors.find(t => t.id === tutorOption.value) };
        });
        const onAdditionalCommentsChange = e => this.setState({ additionalComments: e.target.value });

        const handleScheduleAppointmentError = (err) => {
            if (err.data && err.data.error) {
                switch (err.data.status) {
                case 401: {
                    this.props.displayMessageModal({ message: `${err.data.error}`, redirectToAfterClosing: '/auth/signin' });
                    this.props.signoutUser();
                    break;
                }
                case 422: {
                    const shouldRedirectToProfile = (message) => message.toLowerCase().includes('profile');

                    if (shouldRedirectToProfile(err.data.error)) {
                        this.props.displayMessageModal({ message: `${err.data.error}`, redirectToAfterClosing: '/schedule/profile' });
                    } else {
                        this.props.displayMessageModal({ message: `${err.data.error}` });
                    }

                    break;
                }
                default: {
                    this.props.displayMessageModal({ message: `${err.data.error}` });
                    break;
                }
                }
            } else {
                this.props.displayMessageModal({ message: 'Something went wrong, please try again.' });
            }
        };

        const onScheduleAppointment = () => {
            const { requestedTutor, additionalComments } = this.state;
            this.props.scheduleAppointment({ location, subject, course, time, requestedTutor, additionalComments })
                .then(
                    (res) => this.props.getUserProfile().then(
                        // profile must be re-retreived after scheduling an
                        // appointment and before redirect because it will be
                        // updated if no preferences are already in place
                        () => this.props.displayMessageModal({ message: this.successMessage({ location, course, time }), redirectToAfterClosing: '/schedule/profile' })),
                    (err) => handleScheduleAppointmentError(err));
            this.props.displayLoadingModal();
        };
        return (
            <Modal isOpen={true}
                   onRequestClose={this.props.onRequestClose.bind(this)}
                   contentLabel="Tutor Selecion Modal"
                   className="scheduling-modal">
                <h2 className="modal-title">Confirm your appointment details</h2>
                <h3 className="modal-subtitle">{getAppointmentInfoDisplay(selectedOpenSpotInfo)}</h3>

                <FilterControls options={getTutorOptions(this.state)}
                                disableNullOption
                                testId={TEST_ID.MODAL_TUTOR_SELECT}
                                label="Select your tutor"
                                currentValue={this.state.requestedTutor ? this.state.requestedTutor.id : null}
                                onChange={onTutorSelect}
                                placeholder="Select a tutor..." />

                <div className="textarea-input-group">
                    <label htmlFor="textarea-additional-comments">Additional comments</label>
                    <textarea value={this.state.additionalInfo}
                              id="textarea-additional-comments"
                              onChange={onAdditionalCommentsChange} />
                </div>

                <div className="buttons-input-group-wrap">
                    <button onClick={this.props.onRequestClose.bind(this)}
                            className="button-request-close">Cancel</button>
                    <button onClick={onScheduleAppointment}
                            data-test={TEST_ID.MODAL_SUBMIT_BUTTON}
                            className="button-confirm-action">Schedule</button>
                </div>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedOpenSpotInfo: state.scheduling.showSchedule.selectedOpenSpotInfo,
    };
}

export default connect(mapStateToProps, {
    clearOpenSpotSelection,
    scheduleAppointment,
    displayLoadingModal,
    displayMessageModal,
    signoutUser,
    getUserProfile,
})(TutorSelectionModal);
