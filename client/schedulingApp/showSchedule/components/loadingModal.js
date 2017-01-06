import React from 'react';
import Modal from 'react-modal';

import LoadingSpinner from '../../../components/loadingSpinner';

export default ({ onRequestClose }) => (
    <Modal isOpen={true}
           onRequestClose={onRequestClose}
           contentLabel="Loading Modal"
           className="loading-modal">
        <LoadingSpinner />
    </Modal>
);
