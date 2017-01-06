import React from 'react';
import Modal from 'react-modal';

export default ({ onRequestClose, message }) => (
    <Modal isOpen={true}
           onRequestClose={onRequestClose}
           className="confirmation-modal"
           contentLabel="Message Modal">
        <h2 className="message">{message}</h2>
        <div className="buttons">
            <span onClick={onRequestClose}
                  className="nondestructive nonaction">Close</span>
        </div>
    </Modal>
);
