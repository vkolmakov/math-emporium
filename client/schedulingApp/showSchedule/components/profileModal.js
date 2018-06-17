import React, { Component } from "react";
import { connect } from "react-redux";

import Modal from "@client/components/Modal";
import Form from "@client/components/form/index";

import { isPotentialPhoneNumber } from "@client/utils";
import { TEST_ID } from "@client/constants";

import { updateUserProfile } from "../../profile/actions";
import {
    displayLoadingModal,
    displayMessageModal,
    displayTutorSelectionModal,
    getAvailableTutors,
} from "../actions";

class MiniProfileForm extends Component {
    constructor() {
        super();

        this.state = {
            phoneNumber: "",
            success: false,
            error: null,
        };
    }

    onFormSubmit(e) {
        function chainErrorHandler(errorHandler) {
            // this pattern is required because each step of the submission has it's own error handler
            // and it is crucial that ONLY the error handler of the failed step executes
            return (err) => {
                if (typeof err.handler === "function") {
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
        const { lastActiveElement } = this.props;

        const displayLoadingModalAndGetAvailableTutors = (
            selectedOpenSpotInfo
        ) => () => {
            const { time, course, location, subject } = selectedOpenSpotInfo;
            this.props.displayLoadingModal();
            return this.props.getAvailableTutors({
                time,
                course,
                location,
                subject,
            });
        };

        const displayErrorMessageModal = (err) =>
            this.props.displayMessageModal({
                message:
                    err.data && err.data.error
                        ? `${err.data.error}`
                        : "Something went wrong, please try again.",
            });

        const setFormError = (err) => {
            if (typeof err === "object" && !!err.data) {
                // server-side error
                this.setState({ error: err.data.error });
            } else if (typeof err === "string") {
                this.setState({ error: err });
            }
        };

        const displayTutorSelectionModalOrError = (tutors) =>
            tutors.length > 0
                ? this.props.displayTutorSelectionModal({
                      tutors,
                      lastActiveElement,
                  })
                : this.props.displayMessageModal({
                      message:
                          "There are no more tutors left for this time slot.",
                  });

        if (!!phoneNumber && isPotentialPhoneNumber(phoneNumber)) {
            this.props
                .updateUserProfile({ phoneNumber })
                .then(
                    displayLoadingModalAndGetAvailableTutors(
                        this.props.selectedOpenSpotInfo
                    ),
                    chainErrorHandler(setFormError)
                )
                .then(
                    (res) => res.data,
                    chainErrorHandler(displayErrorMessageModal)
                )
                .then(
                    displayTutorSelectionModalOrError,
                    chainErrorHandler(displayErrorMessageModal)
                )
                .catch((err) => err.handler(err.originalError));
        } else {
            setFormError("Please enter a valid phone number");
        }
    }

    render() {
        const handleSubmit = this.onFormSubmit.bind(this);
        const config = {
            hideSubmitButton: true,
            handleSubmit,
            title: "Please provide a phone number",
            description:
                "In the event that your scheduled tutor becomes unavailable or is running late, we will reach out to you to let you know",
            fields: [
                {
                    label: "Phone number",
                    input: {
                        type: "text",
                        testId: TEST_ID.MODAL_PHONE_NUMBER_FIELD,
                        binding: {
                            onChange: (e) =>
                                this.setState({ phoneNumber: e.target.value }),
                            value: this.state.phoneNumber,
                        },
                    },
                },
            ],
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
        selectedOpenSpotInfo:
            state.scheduling.showSchedule.selectedOpenSpotInfo,
        lastActiveElement:
            state.scheduling.showSchedule.modalInfo.lastActiveElement,
    };
}

const ConnectedMiniProfileForm = connect(
    mapStateToProps,
    {
        updateUserProfile,
        displayLoadingModal,
        displayMessageModal,
        displayTutorSelectionModal,
        getAvailableTutors,
    },
    null,
    { withRef: true }
)(MiniProfileForm);

export default class ProfileModal extends Component {
    render() {
        const { onRequestClose } = this.props;

        const saveProfileFormRef = (profileFormRef) => {
            this.profileFormRef = profileFormRef
                ? profileFormRef.getWrappedInstance()
                : null;
        };

        return (
            <Modal
                isOpen={true}
                contentLabel="Profile Modal"
                onRequestClose={onRequestClose}
                className="profile-form-modal">
                <ConnectedMiniProfileForm ref={saveProfileFormRef} />

                <div className="buttons-input-group-wrap">
                    <button
                        onClick={onRequestClose}
                        className="button-request-close">
                        Cancel
                    </button>
                    <button
                        onClick={() => this.profileFormRef.onFormSubmit()}
                        data-test={TEST_ID.MODAL_SUBMIT_BUTTON}
                        className="button-confirm-action">
                        Submit
                    </button>
                </div>
            </Modal>
        );
    }
}
