import React from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router';

import Select from '../../../components/select/reactSelectWrapper';

export default ({ onRequestClose, tutorOptions, onScheduleAppointment }) => (
    <Modal isOpen={true}
           onRequestClose={onRequestClose}
           contentLabel="Tutor Selecion Modal"
           className="scheduling-modal">
        <h2>Confirm your appointment details</h2>
        <h2>Hello there!</h2>
        <div className="controls-wrapper">
            <h2>Select a tutor:</h2>
            <Select options={tutorOptions} />
            <textarea placeholder="Additional comments..."/>
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