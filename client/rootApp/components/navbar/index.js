import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { AUTH_GROUPS } from '../../../constants';

class Navbar extends Component {
    renderAuthLinks() {
        let links;
        if (!this.props.authenticated) {
            links = [
                <Link to="/signin" key={1}>Sign in</Link>,
                <Link to="/signup" key={2}>Sign up</Link>,
            ];
        } else {
            links = [];
            switch (this.props.authGroup) {
            case AUTH_GROUPS.employer:
            case AUTH_GROUPS.employee:
                links.push(<Link to="/edit-schedule" key={2}>Edit-schedule</Link>);
            case AUTH_GROUPS.user:
            default:
                links.push(<Link to="/signout" key={1}>Sign out</Link>);
            }
        }

        return links;
    }
    render() {
        return (
            <nav>
              <Link to="/">Home</Link>
              <Link to="/schedule">Schedule</Link>
              {this.renderAuthLinks()}
            </nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
        authGroup: state.auth.group,
    };
}

export default connect(mapStateToProps)(Navbar);
