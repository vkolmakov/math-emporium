import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import Select from '../../../components/select/reactSelectWrapper';

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
                .then(res => this.props.displayMessageModal({ message: 'Your appointment was successfully scheduled!' }),
                      err => {
                          if (err.data && err.data.error) {
                              this.props.displayMessageModal({ message: `Oops... ${err.data.error}` });
                          } else {
                              this.props.displayMessageModal({ message: 'Oops... Something went wrong, please try again.' });
                          }
                      });
            this.props.displayLoadingModal();
        };

        return (
            <Modal isOpen={true}
                   onRequestClose={onRequestClose}
                   contentLabel="Tutor Selecion Modal"
                   className="scheduling-modal">
                <h2>Confirm your appointment details</h2>
                <h2>{appointmentInfoDisplay}</h2>
                <div className="controls-wrapper">
                    <h2>Select a tutor:</h2>
                    <Select options={tutorOptions}
                            value={this.state.requestedTutor ? this.state.requestedTutor.id : null}
                            searchable={false}
                            clearable={false}
                            onChange={onTutorSelect}
                            placeholder="Select a tutor..." />
                    <textarea value={this.state.additionalInfo}
                              onChange={onAdditionalCommentsChange}
                              placeholder="Additional comments..." />
                </div>

                <div className="buttons">
                    <span onClick={onScheduleAppointment}
                          className="nondestructive action">Schedule</span>
                    <span onClick={onRequestClose}
                          className="destructive nonaction">Cancel</span>
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
