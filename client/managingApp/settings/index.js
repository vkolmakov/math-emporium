import React, { Component } from 'react';
import { connect } from 'react-redux';

import Form from '../../components/form/index';

class ManageSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const settings = this.props.settings;
        this.setState(settings);
    }

    render() {
        const onSubmit = (event) => {
            console.log('submitted', event);
        };

        const toFormTextField = (settingKey) => {
            return {
                label: settingKey,
                input: {
                    type: 'text',
                    controlValue: this.state[settingKey],
                    binding: {
                        onChange: (event) => this.setState({ [settingKey]: event.target.value }),
                    },
                },
            };
        };

        const config = {
            handleSubmit: onSubmit.bind(this),
            title: 'Update application settings',
            fields: Object.keys(this.props.settings).map(toFormTextField),
            error: this.state.error,
            success: false,
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

export default connect(mapStateToProps, null)(ManageSettings);
