import React from "react";

import Modal from "./Modal";

import LoadingSpinner from "./loadingSpinner";

export default ({ onRequestClose, height }) => (
    <Modal
        isOpen={true}
        onRequestClose={onRequestClose}
        shouldCloseOnOverlayClick={false}
        contentLabel="Loading Modal"
        className="loading-modal">
        <LoadingSpinner height={height} />
    </Modal>
);
