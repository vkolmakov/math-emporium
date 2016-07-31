import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';
import { getUsers } from './actions';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';

class ManageUsers extends Component {
    componentWillMount() {
        this.props.getUsers();
    }

    render() {
        const { users } = this.props;

        if (!users.all) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        const tableHeaders = [
            {
                dataKey: 'email',
                label: 'email',
            }, {
                dataKey: 'active',
                label: 'active',
            }, {
                dataKey: 'group',
                label: 'group',
            },
        ];

        const tableActions = [
            {
                label: 'Edit',
                action: `/${BASE_PATH}/users`,
            },
        ];


        return (
            <div className="content">
              <div className="content-nav">
                <h2>Users</h2>
              </div>

              <div className="list-wrap right-col">
                <Table headers={tableHeaders}
                       data={users.all}
                       actions={tableActions} />
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log(state);
    return {
        users: {
            all: state.managing.users.all,
        },
    };
}

export default connect(mapStateToProps, { getUsers })(ManageUsers);
