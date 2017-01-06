import React, { Component } from 'react';
import Modal from 'react-modal';

import Form from '../../../components/form/index';

class MiniProfileForm extends Component {
    constructor() {
        super();

        this.state = {
            firstName: '',
            lastName: '',
            success: false,
            error: false,
        };
    }

    render() {
        const handleSubmit = e => {
            e.preventDefault();
            console.log('submitted');
        };

        const config = {
            handleSubmit,
            title: 'Update your profile',
            fields: [{
                label: 'First Name',
                input: {
                    type: 'text',
                    binding: {
                        onChange: e => this.setState({ firstName: e.target.value }),
                    },
                },
            }, {
                label: 'Last Name',
                input: {
                    type: 'text',
                    binding: {
                        onChange: e => this.setState({ lastName: e.target.value }),
                    },
                },
            }],
            error: null,
            success: false,
        };

        return (
            <div className="edit-profile-form-wrap">
              <Form {...config} />
            </div>
        );
    }
}

export default ({ onRequestClose, onSubmitSuccess }) => (
    <Modal isOpen={true}
           contentLabel="Profile Modal"
           onRequestClose={onRequestClose}
           className="profile-form-modal">
        <MiniProfileForm onSubmitSuccess={onSubmitSuccess} />
    </Modal>
);
