import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { AUTH_GROUPS } from '../../../constants';
import { id, createClassName } from '../../../utils';

const NavLink = ({ to, className, children }) => (
    <Link to={to} key={to} className={createClassName(['nav-link', className])}>{children}</Link>
);

class Navbar extends Component {
    authLinks() {
        let links = [];
        if (!this.props.authenticated) {
            links = [
                <NavLink to="/signin" className="auth-link">Sign in</NavLink>,
            ];
        } else {
            switch (this.props.authGroup) {
            case AUTH_GROUPS.admin:
            case AUTH_GROUPS.employer:
                links = [<NavLink to="/edit-schedule">Edit-schedule</NavLink>,
                         <NavLink to="/manage-portal">Manage-portal</NavLink>];
                break;
            case AUTH_GROUPS.employee:
                links = [<NavLink to="/edit-schedule">Edit-schedule</NavLink>];
                break;
            case AUTH_GROUPS.user:
            default:
                break;
            }
            links = links.concat([<NavLink to="/signout" className="auth-link">Sign out ({this.props.email})</NavLink>]);
        }

        return links;
    }
    render() {
        const authLinks = this.authLinks();
        return (
            <nav>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/schedule">Schedule</NavLink>
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
