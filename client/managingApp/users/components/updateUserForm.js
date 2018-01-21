import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';


import { selectTransformOptions } from '../../../editingApp/utils';
import { AUTH_GROUPS } from '../../constants';
import { getUsers, updateUser } from '../actions';

import Form from '../../../components/form/index';

const FORM_NAME = 'UpdateUserForm';
const FORM_FIELDS = ['group'];

function getAuthGroupOptions(groups) {
    return Object.keys(groups).map(
        display => ({ value: groups[display], display }));
}

class UpdateUserForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { group } = this.props.selectedUser;

        this.props.dispatch(initialize(FORM_NAME, {
            group,
        }, FORM_FIELDS));
    }

    render() {
        const { group } = this.props.fields;

        const groupOptions = selectTransformOptions('value', 'display')(getAuthGroupOptions(AUTH_GROUPS));

        const onSubmit = (data) => {
            this.setState({ success: false });
            this.props.updateUser(this.props.selectedUser.id, data)
                .then(result => {
                    if (!result.error) {
                        this.setState({ success: true });
                    } else {
                        this.setState({ error: result.error });
                    }
                    return Promise.resolve();
                })
                .then(this.props.getUsers);
        };

        const handleSubmit = this.props.handleSubmit(onSubmit.bind(this));

        const title = 'Update User';

        const fields = [
            {
                label: 'access group',
                input: {
                    type: 'select',
                    binding: group,
                    options: groupOptions,
                },
            },
        ];

        const formConfig = {
            handleSubmit,
            title,
            fields,
            error: this.state.error,
            success: this.state.success,
        };

        return (
            <div className="list-wrap">
              <Form {...formConfig} />
            </div>
        );
    }
}

function validate(values) {
    const errors = {};

    const required = {
        group: 'Must select one group',
    };

    Object.keys(required).forEach(key => {
        if (!values[key]) errors[key] = required[key];
    });

    return errors;
}

export default reduxForm({
    form: FORM_NAME,
    fields: FORM_FIELDS,
    validate,
}, null, { updateUser, getUsers })(UpdateUserForm);
