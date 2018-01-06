import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { AUTH_GROUPS } from '../../../constants';
import { createClassName } from '../../../utils';

const NavLink = ({ to, className, children }) => (
    <Link to={to} key={to} className={createClassName(['nav-link', className])}>{children}</Link>
);

class Navbar extends Component {
    links() {
        let links = [];
        if (this.props.authenticated) {
            switch (this.props.authGroup) {
            case AUTH_GROUPS.admin:
            case AUTH_GROUPS.employer:
                links = [{ to: '/edit-schedule', children: 'Edit-schedule' },
                         { to: '/manage-portal', children: 'Manage-portal' }];
                break;
            case AUTH_GROUPS.employee:
                links = [{ to: '/edit-schedule', children: 'Edit-schedule' }];
                break;
            case AUTH_GROUPS.user:
            default:
                break;
            }
        }

        return links;
    }
    render() {
        const links = this.links();
        const authLinks = this.authLinks();
        return (
            <nav>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/schedule">Schedule</NavLink>
              {links.map(NavLink)}
              <div className="auth-links">{authLinks.map(NavLink)}</div>
            </nav>
        );
    }
    authLinks() {
        return this.props.authenticated
            ? [{ to: '/signout', className: 'auth-link', children: `Sign out (${this.props.email})` }]
            : [{ to: '/signin', className: 'auth-link', children: 'Sign in' }];
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
