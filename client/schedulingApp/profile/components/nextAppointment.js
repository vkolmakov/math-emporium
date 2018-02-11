import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Modal from 'react-modal';
import moment from 'moment';

import Faq from './faq';

import { BASE_PATH, TIMESTAMP_DISPLAY_FORMAT } from '../../constants';
import { deleteAppointment } from '../actions';

class NextAppointment extends Component {
    constructor() {
        super();
        this.PROFILE_PAGE_URL = `/${BASE_PATH}/profile/#`;
        this.state = {
            displayModal: false,
        };
    }

    openModal(e) {
        e.preventDefault();
        this.setState({
            displayModal: true,
        });
    }

    closeModal(e) {
        e.preventDefault();
        this.setState({
            displayModal: false,
        });
    }

    deleteAppointment(e) {
        e.preventDefault();
        this.props.deleteAppointment()
            .then(_ => {
                this.setState({
                    displayModal: false,
                });
            });
    }

    renderDeleteLinkAndModal() {
        return [
            <Link to={this.PROFILE_PAGE_URL}
                   onClick={this.openModal.bind(this)}
                   className="destructive action"
                   key={1}>Cancel my appointment</Link>,
            <Modal isOpen={this.state.displayModal}
                   onRequestClose={this.closeModal.bind(this)}
                   className="confirmation-modal"
                   key={2}>
              <h2 className="modal-title">Are you sure you want to cancel your appointment?</h2>
              <div className="buttons-input-group-wrap">
                <button onClick={this.deleteAppointment.bind(this)}
                      className="destructive action">Yes</button>
                <button onClick={this.closeModal.bind(this)}
                      className="nondestructive nonaction">No</button>
              </div>
            </Modal>,
        ];
    }

    render() {
        const { profile } = this.props;

        const nextAppointment = moment(profile.googleCalendarAppointmentDate);
        const now = moment();
        const hasUpcomingAppointment = nextAppointment.isValid() && nextAppointment.isAfter(now);

        let nextAppointmentDisplay;
        if (hasUpcomingAppointment) {
            nextAppointmentDisplay = `Is on ${nextAppointment.format(TIMESTAMP_DISPLAY_FORMAT)}`;
        } else {
            nextAppointmentDisplay = 'You have no upcoming appointments';
        }

        return (
            <div className="next-appointment-wrap">
              <div className="next-appointment">
                <h2>Your next appointment</h2>
                <p>{nextAppointmentDisplay}</p>
                {hasUpcomingAppointment ? this.renderDeleteLinkAndModal() : ''}
              </div>

              <Faq></Faq>

            </div>
        );
    }
}

export default connect(null, { deleteAppointment })(NextAppointment);
