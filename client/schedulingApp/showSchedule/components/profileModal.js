import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';

import Form from '../../../components/form/index';
import { updateUserProfile } from '../../profile/actions';
import { displayLoadingModal,
         displayMessageModal,
         displayTutorSelectionModal,
         getAvailableTutors } from '../actions';

class MiniProfileForm extends Component {
    constructor() {
        super();

        this.state = {
            firstName: '',
            lastName: '',
            success: false,
            error: null,
        };
    }

    render() {
        const onSubmit = e => {
            e.preventDefault();
            const { firstName, lastName } = this.state;

            if (firstName && lastName) {
                const { time, course, location } = this.props.selectedOpenSpotInfo;
                this.setState({ error: null });
                this.props.displayLoadingModal();
                this.props.updateUserProfile({ firstName, lastName }).then(
                    res => this.props.getAvailableTutors({ time, course, location }),
                    err => this.props.displayMessageModal({ message: 'Something went wrong, please try again.' })
                ).then(
                    res => res.data,
                    err => this.props.displayMessageModal({
                        message: err.data && err.data.error
                            ? `${err.data.error}`
                            : 'Something went wrong, please try again.',
                    })
                ).then(tutors => tutors.length > 0
                       ? this.props.displayTutorSelectionModal({ tutors })
                       : this.props.displayMessageModal({ message: 'There are no more tutors left for this time slot.' }));
            } else {
                this.setState({ error: 'Please enter your first and last name' });
            }
        };

        const handleSubmit = onSubmit.bind(this);
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
            error: this.state.error,
            success: false,
        };

        return (
            <div className="edit-profile-form-wrap">
              <Form {...config} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedOpenSpotInfo: state.scheduling.showSchedule.selectedOpenSpotInfo,
    };
}

const ConnectedMiniProfileForm = connect(mapStateToProps, {
    updateUserProfile,
    displayLoadingModal,
    displayMessageModal,
    displayTutorSelectionModal,
    getAvailableTutors,
})(MiniProfileForm);

export default ({ onRequestClose }) => (
    <Modal isOpen={true}
           contentLabel="Profile Modal"
           onRequestClose={onRequestClose}
           className="profile-form-modal">
        <ConnectedMiniProfileForm />
    </Modal>
);
