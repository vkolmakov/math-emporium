import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import moment from 'moment';

import MessageModal from '../../../components/messageModal';
import LoadingModal from '../../../components/loadingModal';

import { deleteAppointment } from '../actions';
import { TIMESTAMP_DISPLAY_FORMAT } from '../../../constants';

const MODAL_STATE = {
    NONE: 0,
    CONFIRMATION: 1,
    LOADING: 2,
    MESSAGE: 3,
};

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
            <button
              className="individual-appointment-cancel-action"
              onClick={createAppointmentCancelClickHandler(id)}>Cancel</button>
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
        <button onClick={onClose}
                className="button-request-close">No</button>
        <button onClick={onConfirm}
                className="button-confirm-action">Yes</button>
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
            modalState: MODAL_STATE.NONE,
            modalMessage: '',
            appointmentToDelete: { id: null },
        };
    }

    deleteSelectedAppointment() {
        const { deleteAppointment } = this.props;
        const { appointmentToDelete } = this.state;

        this.setState({ modalState: MODAL_STATE.LOADING });

        return deleteAppointment(appointmentToDelete).then(() => {
            this.setState({ modalState: MODAL_STATE.MESSAGE, modalMessage: 'Your appointment was successfully cancelled.' });
        });
    }

    resetState() {
        const initialState = this.initialState;
        this.setState(initialState);
    }

    createAppointmentCancelClickHandler(id) {
        return (event) => {
            this.setState({
                modalState: MODAL_STATE.CONFIRMATION,
                appointmentToDelete: { id },
            });
        };
    }

    render () {
        const { appointments, courses, locations } = this.props;

        const MaybeModal = ({ modalState }) => {
            switch(modalState) {
            case MODAL_STATE.CONFIRMATION: {
                return (
                    <ConfirmationModal
                      isOpen={true}
                      onClose={this.resetState.bind(this)}
                      onConfirm={this.deleteSelectedAppointment.bind(this)}></ConfirmationModal>
                );
            }
            case MODAL_STATE.LOADING: {
                return (<LoadingModal height="3em" onRequestClose={this.resetState.bind(this)}></LoadingModal>);
            }
            case MODAL_STATE.MESSAGE: {
                return (
                    <MessageModal
                      onRequestClose={this.resetState.bind(this)}
                      message={this.state.modalMessage}></MessageModal>
                );
            }
            case MODAL_STATE.NONE:
            default:
                return (<span></span>);
            }
        };


        const AppointmentsOrMessage = () => appointments.length > 0 ? (
            <ul className="appointments-list">
              {appointments.map(SingleAppointment(courses, locations, this.createAppointmentCancelClickHandler.bind(this)))}
            </ul>
        ) : <p>You have no upcoming appointments.</p>;

        return (
            <div className="appointments">
              <h2>Appointments</h2>
              <AppointmentsOrMessage></AppointmentsOrMessage>
              <MaybeModal modalState={this.state.modalState}></MaybeModal>
            </div>
        );
    };
}

export default connect(null, {
    deleteAppointment,
})(Appointments);
