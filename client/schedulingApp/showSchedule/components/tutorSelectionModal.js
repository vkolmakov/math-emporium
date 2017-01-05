import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';
import { Link } from 'react-router';

import Select from '../../../components/select/reactSelectWrapper';

import { clearOpenSpotSelection } from '../actions';
import { TIMESTAMP_DISPLAY_FORMAT } from '../../constants';

class TutorSelectionModal extends Component {
    constructor() {
        super();
        this.state = {
            additionalInfo: '',
            selectedTutor: null,
        };
    }

    render() {
        const { selectedOpenSpotInfo } = this.props;
        const { course, location, time, tutors } = selectedOpenSpotInfo;

        const tutorOptions = tutors.map(t => ({ label: t.name, value: t.id }));
        const displayTime = time.format(TIMESTAMP_DISPLAY_FORMAT);
        const appointmentInfoDisplay = `${course.code} on ${displayTime}`;

        const selectedTutor = null;

        const onRequestClose = this.props.clearOpenSpotSelection;
        const onTutorSelect = tutorOption => this.setState({ selectedTutor: tutors.find(t => t.id === tutorOption.value) });
        const onAdditionalCommentsChange = e => this.setState({ additionalInfo: e.target.value });

        const onScheduleAppointment = () => console.log('Scheduling an appointment...');

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
                            value={this.state.selectedTutor ? this.state.selectedTutor.id : null}
                            searchable={false}
                            clearable={false}
                            onChange={onTutorSelect}
                            placeholder="Select a tutor..." />
                    <textarea value={this.state.additionalInfo}
                              onChange={onAdditionalCommentsChange}
                              placeholder="Additional comments..." />
                </div>

                <div className="buttons">
                    <Link to="#"
                          onClick={onScheduleAppointment}
                          className="nondestructive action">Schedule</Link>
                    <Link to="#"
                          onClick={onRequestClose}
                          className="destructive nonaction">Cancel</Link>
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
})(TutorSelectionModal);
