import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import moment from 'moment';

import { deleteAppointment } from '../actions';
import { TIMESTAMP_DISPLAY_FORMAT } from '../../../constants';

const SingleAppointment = (courses, locations, createAppointmentCancelClickHandler) => ({ id, location, course, time }) => {
    const locationName = locations.find((l) => l.id === location.id).name;
    const courseCode = courses.find((c) => c.id === course.id).code;
    const formattedTime = moment(time).format(TIMESTAMP_DISPLAY_FORMAT);

    return (
        <li key={id} className="individual-appointment">
          <div className="individual-appointment-description">
            <div className="details">
              {courseCode} at {locationName}
            </div>
            <div className="time">
              on {formattedTime}
            </div>
          </div>

          <div className="individual-appointment-actions">
            <button onClick={createAppointmentCancelClickHandler(id)}>Cancel</button>
          </div>
        </li>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
    <Modal isOpen={isOpen}
           onRequestClose={onClose}
           className="confirmation-modal">
      <h2 className="modal-title">Are you sure you want to cancel your appointment?</h2>
      <div className="buttons-input-group-wrap">
        <button onClick={onConfirm}
                className="destructive action">Yes</button>
        <button onClick={onClose}
                className="nondestructive nonaction">No</button>
      </div>
    </Modal>
);

class Appointments extends Component {
    constructor() {
        super();
        this.state = this.initialState;
    }

    get initialState() {
        return {
            isDeletionConfirmationModalOpen: false,
            appointmentToDelete: { id: null },
        };
    }

    deleteSelectedAppointment() {
        const { deleteAppointment } = this.props;
        const { appointmentToDelete } = this.state;

        return deleteAppointment(appointmentToDelete).then(() => {
            this.resetState();
        });
    }

    resetState() {
        const initialState = this.initialState;
        this.setState(initialState);
    }

    createAppointmentCancelClickHandler(id) {
        return (event) => {
            this.setState({
                isDeletionConfirmationModalOpen: true,
                appointmentToDelete: { id },
            });
        };
    }

    render () {
        const { appointments, courses, locations } = this.props;

        const AppointmentsOrMessage = () => appointments.length > 0 ? (
            <ul className="appointments-list">
              {appointments.map(SingleAppointment(courses, locations, this.createAppointmentCancelClickHandler.bind(this)))}
            </ul>
        ) : <p>You have no upcoming appointments.</p>;

        return (
            <div className="appointments">
              <h2>Appointments</h2>
              <AppointmentsOrMessage></AppointmentsOrMessage>
              <ConfirmationModal
                isOpen={this.state.isDeletionConfirmationModalOpen}
                onClose={this.resetState.bind(this)}
                onConfirm={this.deleteSelectedAppointment.bind(this)}></ConfirmationModal>
            </div>
        );
    };
}

export default connect(null, {
    deleteAppointment,
})(Appointments);
