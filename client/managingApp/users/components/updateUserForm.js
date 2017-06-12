import React, { Component } from 'react';
import { reduxForm, initialize } from 'redux-form';


import { selectTransformOptions } from '../../../editingApp/utils';
import { AUTH_GROUPS_OPTIONS } from '../../constants';
import { getUsers, updateUser } from '../actions';

import Form from '../../../components/form/index';

const FORM_NAME = 'UpdateUserForm';
const FORM_FIELDS = ['email', 'group'];

class UpdateUserForm extends Component {
    constructor() {
        super();
        this.state = {
            success: false,
        };
    }

    componentDidMount() {
        const { email, group } = this.props.selectedUser;

        this.props.dispatch(initialize(FORM_NAME, {
            email,
            group,
        }, FORM_FIELDS));
    }

    render() {
        const { email, group } = this.props.fields;

        const groupOptions = selectTransformOptions('value', 'display')(AUTH_GROUPS_OPTIONS);

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
                label: 'email',
                input: {
                    type: 'email',
                    binding: email,
                },
            }, {
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
        email: 'Must have an email',
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
