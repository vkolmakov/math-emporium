import React, { Component } from "react";
import { connect } from "react-redux";

import LoadingSpinner from "../../../components/loadingSpinner";
import UpdateUserForm from "./updateUserForm";

class UserDetail extends Component {
    render() {
        const { users } = this.props;
        const { id } = this.props.match.params;

        const selectedUser = users.all.find(
            (user) => user.id === parseInt(id, 10)
        );

        if (!selectedUser) {
            return (
                <div className="content">
                    <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="content">
                <UpdateUserForm selectedUser={selectedUser} />
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

export default connect(mapStateToProps)(UserDetail);
