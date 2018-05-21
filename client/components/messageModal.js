import React from 'react';
import Modal from 'react-modal';

import { TEST_ID } from '../constants';

export default ({ onRequestClose, message }) => (
    <Modal isOpen={true}
           onRequestClose={onRequestClose}
           className="message-modal"
           contentLabel="Message Modal">
      <h2 className="modal-title">{message}</h2>
        <div className="buttons-input-group-wrap">
            <span className="filler"></span>
            <button onClick={onRequestClose}
                    data-test={TEST_ID.MODAL_CLOSE_BUTTON}
                    className="nondestructive">Close</button>
        </div>
    </Modal>
);
