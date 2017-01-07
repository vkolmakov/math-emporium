import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Modal from 'react-modal';
import moment from 'moment';

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
              <h2>Are you sure you want to cancel your appointment?</h2>
              <div className="buttons">
                <span onClick={this.deleteAppointment.bind(this)}
                      className="destructive action">Yes</span>
                <span onClick={this.closeModal.bind(this)}
                      className="nondestructive nonaction">No</span>
              </div>
            </Modal>,
        ];
    }

    renderFaq() {
        return (
              <ul>
                <li>
                  <p className="question">How do I schedule an appointment?</p>
                  <p className="answer">On the menu to the left (or above on mobile) select Show Schedule item. Select a location you want to go to and a class, and after that choose a time.</p>
                </li>
                <li>
                  <p className="question">How to reschedule an appointment?</p>
                  <p className="answer">If you have an upcomming appointment simply delete it and schedule another one.</p>
                </li>
                <li>
                  <p className="question">Why can't I have more than one upcomming appointment?</p>
                  <p className="answer">Because we're trying to make sure that everyone who needs a tutoring appointment has a chance to get one.</p>
                </li>
                <li>
                  <p className="question">Can I get a recurring appointment?</p>
                  <p className="answer">Come talks to us! ;)</p>
                </li>
              </ul>
        );
    }

    render() {
        const { profile } = this.props;

        const nextAppointment = moment(profile.googleCalendarAppointmentDate);
        const now = moment();
        const hasUpcommingAppointment = nextAppointment.isValid() && nextAppointment.isAfter(now);

        let nextAppointmentDisplay;
        if (hasUpcommingAppointment) {
            nextAppointmentDisplay = `Is on ${nextAppointment.format(TIMESTAMP_DISPLAY_FORMAT)}`;
        } else {
            nextAppointmentDisplay = 'You have no upcomming appointments';
        }

        return (
            <div className="next-appointment-wrap">
              <div className="next-appointment">
                <h2>Your next appointment</h2>
                <p>{nextAppointmentDisplay}</p>
                {hasUpcommingAppointment ? this.renderDeleteLinkAndModal() : ''}
              </div>

              <div className="faq">
                <h2>FAQ</h2>
                {this.renderFaq()}
              </div>
            </div>
        );
    }
}

export default connect(null, { deleteAppointment })(NextAppointment);
