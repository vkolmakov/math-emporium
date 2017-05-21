import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import FilterControls from '../../../components/filterControls';

import { clearOpenSpotSelection,
         scheduleAppointment,
         displayLoadingModal,
         displayMessageModal } from '../actions';

import { TIMESTAMP_DISPLAY_FORMAT, RANDOM_TUTOR } from '../../constants';

class TutorSelectionModal extends Component {
    constructor() {
        super();
        this.state = {
            additionalComments: '',
            requestedTutor: null,
            tutors: [],
        };
    }

    componentWillMount() {
        const { selectedOpenSpotInfo } = this.props;

        const tutors = selectedOpenSpotInfo.tutors.length > 1
            ? [RANDOM_TUTOR, ...selectedOpenSpotInfo.tutors]
            : selectedOpenSpotInfo.tutors;

        this.setState({ tutors, requestedTutor: tutors[0] });
    }

    successMessage({ location, course, time }) {
        return `Your appointment for ${course.code} at ${location.name} on ${time.format(TIMESTAMP_DISPLAY_FORMAT)} was successfully scheduled!`;
    }

    render() {
        const { selectedOpenSpotInfo } = this.props;
        const { course, location, time } = selectedOpenSpotInfo;
        const { tutors } = this.state;

        const tutorOptions = tutors.map(t => ({ label: t.name, value: t.id }));

        const displayTime = time.format(TIMESTAMP_DISPLAY_FORMAT);
        const appointmentInfoDisplay = `${course.code} on ${displayTime}`;

        const onRequestClose = this.props.clearOpenSpotSelection;
        const onTutorSelect = tutorOption => this.setState({ requestedTutor: tutors.find(t => t.id === tutorOption.value) });
        const onAdditionalCommentsChange = e => this.setState({ additionalComments: e.target.value });
        const onScheduleAppointment = () => {
            const { requestedTutor, additionalComments } = this.state;
            this.props.scheduleAppointment({ location, course, time, requestedTutor, additionalComments })
                .then(res => this.props.displayMessageModal({ message: this.successMessage({ location, course, time }), redirectToAfterClosing: '/schedule/profile' }),
                      err => {
                          if (err.data && err.data.error) {
                              this.props.displayMessageModal({ message: `${err.data.error}` });
                          } else {
                              this.props.displayMessageModal({ message: 'Something went wrong, please try again.' });
                          }
                      });
            this.props.displayLoadingModal();
        };

        return (
            <Modal isOpen={true}
                   onRequestClose={onRequestClose}
                   contentLabel="Tutor Selecion Modal"
                   className="scheduling-modal">
                <h1>Confirm your appointment details</h1>
                <h2>{appointmentInfoDisplay}</h2>

                <div className="select-input-group-wrap">
                    <label>Select Your Tutor:</label>
                    <FilterControls options={tutorOptions}
                            currentValue={this.state.requestedTutor ? this.state.requestedTutor.id : null}
                            onChange={onTutorSelect}
                            placeholder="Select a tutor..." />
                </div>

                <div className="textarea-input-group-wrap">
                    <label>Additional Comments:</label>
                    <textarea value={this.state.additionalInfo}
                              onChange={onAdditionalCommentsChange} />
                </div>

                <div className="buttons-input-group-wrap">
                    <button onClick={onRequestClose}
                            className="destructive">Cancel</button>
                    <button onClick={onScheduleAppointment}
                            className="nondestructive">Schedule</button>
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
})(TutorSelectionModal);
