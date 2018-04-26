import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { AUTH_GROUPS, TEST_ID } from '../../../constants';
import { createClassName } from '../../../utils';

function isSelected(currentPath, linkPath) {
    const currentTab = currentPath.split('/');
    return linkPath === `/${currentTab[1]}`; // account for the leading '/'
}

const navLinkConstructor = (currentRouterPath) => ({ to, className, children, testId }) => {
    const text = children;

    return (
        <Link to={to}
              key={to}
              data-test={testId}
              data-text={text}
              className={createClassName(['nav-link', className, isSelected(currentRouterPath, to) ? 'selected' : ''])}>{text}</Link>
    );
};

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
        const NavLink = navLinkConstructor(this.props.currentRouterPath);
        return (
            <nav>
              <NavLink to="/">{this.props.applicationTitle}</NavLink>
              <NavLink to="/schedule">Schedule</NavLink>
              {links.map(NavLink)}
              <div className="auth-links">{authLinks.map(NavLink)}</div>
            </nav>
        );
    }
    authLinks() {
        return this.props.authenticated
            ? [{ to: '/signout', className: 'auth-link', children: `Sign out (${this.props.email})`, testId: TEST_ID.SIGNOUT_LINK }]
            : [{ to: '/signin', className: 'auth-link', children: 'Sign in', testId: TEST_ID.SIGNIN_LINK }];
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
        authGroup: state.auth.group,
        email: state.auth.email,
        applicationTitle: state.util.settings.applicationTitle,
        currentRouterPath: state.util.currentRouterPath,
    };
}

export default connect(mapStateToProps)(Navbar);
