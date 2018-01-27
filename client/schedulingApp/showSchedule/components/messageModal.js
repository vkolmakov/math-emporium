import React from 'react';
import Modal from 'react-modal';

export default ({ onRequestClose, message }) => (
    <Modal isOpen={true}
           onRequestClose={onRequestClose}
           className="message-modal"
           contentLabel="Message Modal">
      <h2 className="modal-title">{message}</h2>
        <div className="buttons-input-group-wrap">
            <span className="filler"></span>
            <button onClick={onRequestClose}
                  className="nondestructive">Close</button>
        </div>
    </Modal>
);
