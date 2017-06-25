import React, { Component } from 'react';
import { connect } from 'react-redux';

import { selectTransformOptions } from '../../editingApp/utils';
import { BASE_PATH, AUTH_GROUPS_OPTIONS } from '../constants';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
import FilterControls from '../../components/filterControls';

class ManageUsers extends Component {
    constructor() {
        super();
        this.state = {
            selectedGroup: null,
        };
    }

    setSelectedGroup(groupOption) {
        if (groupOption) {
            const selectedGroup = AUTH_GROUPS_OPTIONS.find(g => g.value === groupOption.value);
            this.setState({ selectedGroup });
        } else {
            this.setState({ selectedGroup: null });
        }
    }

    render() {
        let { users } = this.props;

        const groupOptions = selectTransformOptions('value', 'display')(AUTH_GROUPS_OPTIONS);

        if (!users.all) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        if (this.state.selectedGroup) {
            const { selectedGroup } = this.state;
            const filteredUsers = users.all.filter(u => u.group === selectedGroup.value);
            users = {
                ...users,
                all: filteredUsers,
            };
        }

        const tableHeaders = [
            {
                dataKey: 'email',
                label: 'email',
            }, {
                dataKey: 'group',
                label: 'group',
                mapValuesToLabels: AUTH_GROUPS_OPTIONS,
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
                <FilterControls options={groupOptions}
                                currentValue={this.state.selectedGroup ? this.state.selectedGroup.value : null}
                                onChange={this.setSelectedGroup.bind(this)}
                                placeholder={'Filter by group...'} />
              </div>

              <div className="list-wrap">
                <Table headers={tableHeaders}
                       data={users.all}
                       actions={tableActions} />
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        users: {
            all: state.managing.users.all,
        },
    };
}

export default connect(mapStateToProps)(ManageUsers);
