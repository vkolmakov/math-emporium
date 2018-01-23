import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';

import Form from '../../../components/form/index';
import { updateUserProfile } from '../../profile/actions';
import { displayLoadingModal,
         displayMessageModal,
         displayTutorSelectionModal,
         getAvailableTutors } from '../actions';

import { isPotentialPhoneNumber } from '../../../utils';

class MiniProfileForm extends Component {
    constructor() {
        super();

        this.state = {
            phoneNumber: '',
            success: false,
            error: null,
        };
    }

    onFormSubmit(e) {
        function chainErrorHandler(errorHandler) {
            // this pattern is required because each step of the submission has it's own error handler
            // and it is crucial that ONLY the error handler of the failed step executes
            return (err) => {
                if (typeof err.handler === 'function') {
                    // a handler already exists, don't do anything
                    // and run the first handler instead at the end
                    return Promise.reject(err);
                }

                return Promise.reject({
                    handler: errorHandler,
                    originalError: err,
                });
            };
        }

        if (e) {
            e.preventDefault();
        }

        this.setState({ success: false, error: null });

        const { phoneNumber } = this.state;

        const displayLoadingModalAndGetAvailableTutors = (selectedOpenSpotInfo) => () => {
            const { time, course, location, subject } = selectedOpenSpotInfo;
            this.props.displayLoadingModal();
            return this.props.getAvailableTutors({ time, course, location, subject });
        };

        const displayErrorMessageModal = (err) => this.props.displayMessageModal({
            message: err.data && err.data.error
                ? `${err.data.error}`
                : 'Something went wrong, please try again.',
        });

        const setFormError = (err) => {
            if (typeof err === 'object' && !!err.data) {
                // server-side error
                this.setState({ error: err.data.error });
            } else if (typeof err === 'string') {
                this.setState({ error: err });
            }
        };

        const displayTutorSelectionModalOrError = (tutors) => tutors.length > 0
              ? this.props.displayTutorSelectionModal({ tutors })
              : this.props.displayMessageModal({ message: 'There are no more tutors left for this time slot.' });

        if (!!phoneNumber && isPotentialPhoneNumber(phoneNumber)) {
            this.props.updateUserProfile({ phoneNumber }).then(
                displayLoadingModalAndGetAvailableTutors(this.props.selectedOpenSpotInfo),
                chainErrorHandler(setFormError)
            ).then(
                (res) => res.data,
                chainErrorHandler(displayErrorMessageModal)
            ).then(
                displayTutorSelectionModalOrError,
                chainErrorHandler(displayErrorMessageModal)
            ).catch(
                (err) => err.handler(err.originalError)
            );
        } else {
            setFormError('Please enter a valid phone number');
        }
    };

    render() {
        const handleSubmit = this.onFormSubmit.bind(this);
        const config = {
            hideSubmitButton: true,
            handleSubmit,
            title: 'Please enter your phone number',
            fields: [{
                label: 'Phone number',
                input: {
                    type: 'text',
                    binding: {
                        onChange: e => this.setState({ phoneNumber: e.target.value }),
                        value: this.state.phoneNumber,
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
}, null, { withRef: true })(MiniProfileForm);

export default class ProfileModal extends Component {
    render() {
        const { onRequestClose } = this.props;

        const saveProfileFormRef = (profileFormRef) => {
            this.profileFormRef = !!profileFormRef ? profileFormRef.getWrappedInstance() : null;
        };

        return (
            <Modal isOpen={true}
                   contentLabel="Profile Modal"
                   onRequestClose={onRequestClose}
                   className="profile-form-modal">

              <ConnectedMiniProfileForm ref={saveProfileFormRef}/>

              <div className="buttons-input-group-wrap">
                <button onClick={onRequestClose}
                        className="destructive">Cancel</button>
                <button onClick={() => this.profileFormRef.onFormSubmit()}
                  className="nondestructive">Submit</button>
              </div>
            </Modal>
        );
    }
}
