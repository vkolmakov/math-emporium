import React, { Component } from 'react';
import { connect } from 'react-redux';

import Form from '../../components/form/index';
import { updateSettings } from './actions';

const VISIBLE_SETTINGS_INPUT_TYPE = {
    applicationTitle: 'text',
    duplicateAllEmailsTo: 'text',
    applicationMainHomePictureLink: 'text',
    faqText: 'textarea',
    announcementText: 'textarea',
    announcementBackgroundColor: 'select',
    announcementTextColor: 'select',
    maximumAppointmentsPerUser: 'number',
};

const VISIBLE_SETTINGS_OPTIONS = {
    announcementBackgroundColor: [{
        value: '#ADD3E9',
        label: 'blue',
        color: '#ADD3E9',
    }, {
        value: '#FF5C5C',
        label: 'red',
        color: '#FF5C5C',
    }, {
        value: '#111111',
        label: 'black',
        color: '#111111',
    }, {
        value: '#FFD097',
        label: 'yellow',
        color: '#FFD097',
    }],
    announcementTextColor: [{
        value: '#111111',
        label: 'black',
        color: '#111111',
    }, {
        value: '#FFFFFF',
        label: 'white',
        color: '#FFFFFF',
    }],
};

class ManageSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: {},
            form: { success: false, error: null },
        };
    }

    componentDidMount() {
        const settings = this.props.settings;
        this.setState({ settings });
    }

    render() {
        const onSubmit = (event) => {
            event.preventDefault();
            const settings = this.state.settings;

            this.props.updateSettings(settings)
                .then(() => {
                    this.setState((state) => ({
                        ...state,
                        form: { success: true, error: null },
                    }));
                }, (err) => {
                    this.setState((state) => ({
                        ...state,
                        form: { success: false, error: 'Failed to submit settings' },
                    }));
                });
        };

        const toFormField = (settingKey) => {
            return {
                label: settingKey,
                input: {
                    type: VISIBLE_SETTINGS_INPUT_TYPE[settingKey],
                    controlValue: this.state.settings[settingKey],
                    options: VISIBLE_SETTINGS_OPTIONS[settingKey],
                    binding: {
                        onChange: (event) => {
                            const state = this.state;

                            if (!!event) {
                                if (!!event.target) {
                                    // regular event from text input
                                    state.settings[settingKey] = event.target.value;
                                } else if (!!event.value || !!event.label) {
                                    // change event from a dropdown
                                    state.settings[settingKey] = event.value;
                                }
                            } else {
                                // empty value coming from a dropdown
                                state.settings[settingKey] = null;
                            }

                            this.setState(state);
                        },
                    },
                },
            };
        };

        const config = {
            handleSubmit: onSubmit.bind(this),
            title: 'Update application settings',
            fields: Object.keys(this.props.settings)
                .filter((key) => Object.keys(VISIBLE_SETTINGS_INPUT_TYPE).includes(key))
                .map(toFormField),
            error: this.state.form.error,
            success: this.state.form.success,
        };

        return (
            <div className="list-wrap">
              <Form {...config}></Form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        settings: state.managing.settings,
    };
}

export default connect(mapStateToProps, {
    updateSettings,
})(ManageSettings);
