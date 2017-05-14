import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { AUTH_GROUPS } from '../../../constants';
import { id } from '../../../utils';

class Navbar extends Component {
    authLinks() {
        let links = [];
        if (!this.props.authenticated) {
            links = [
                <Link to="/signin" key={0} className="auth-link">Sign in</Link>,
            ];
        } else {
            switch (this.props.authGroup) {
            case AUTH_GROUPS.admin:
            case AUTH_GROUPS.employer:
                links = [<Link to="/edit-schedule" key={3}>Edit-schedule</Link>,
                         <Link to="/manage-portal" key={4}>Manage-portal</Link>];
                break;
            case AUTH_GROUPS.employee:
                links = [<Link to="/edit-schedule" key={3}>Edit-schedule</Link>];
                break;
            case AUTH_GROUPS.user:
            default:
                break;
            }
            links = links.concat([<Link to="/signout" key={2} className="auth-link">Sign out ({this.props.email})</Link>]);
        }

        return links;
    }
    render() {
        const authLinks = this.authLinks();
        return (
            <nav>
              <Link to="/">Home</Link>
              <Link to="/schedule">Schedule</Link>
              {authLinks.map(id)}
            </nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
        authGroup: state.auth.group,
        email: state.auth.email,
    };
}

export default connect(mapStateToProps)(Navbar);
