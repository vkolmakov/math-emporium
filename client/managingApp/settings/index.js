import React, { Component } from 'react';
import { connect } from 'react-redux';

import Form from '../../components/form/index';
import { updateSettings } from './actions';

const VISIBLE_SETTINGS_INPUT_TYPE = {
    applicationTitle: 'text',
    duplicateAllEmailsTo: 'text',
    applicationMainHomePictureLink: 'text',
    faqText: 'textarea',
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

        const toFormTextField = (settingKey) => {
            return {
                label: settingKey,
                input: {
                    type: VISIBLE_SETTINGS_INPUT_TYPE[settingKey],
                    controlValue: this.state.settings[settingKey],
                    binding: {
                        onChange: (event) => {
                            const state = this.state;
                            state.settings[settingKey] = event.target.value;
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
                .map(toFormTextField),
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
