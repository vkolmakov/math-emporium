import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


class Navbar extends Component {
    renderAuthLinks() {
        let links;
        if (!this.props.authenticated) {
            links = [
                <Link to="/signin" key={1}>Sign in</Link>,
                <Link to="/signup" key={2}>Sign up</Link>,
            ];
        } else {
            links = [
                <Link to="/signout" key={1}>Sign out</Link>,
            ];
        }

        return links;
    }
    render() {
        return (
            <nav>
              <Link to="/">Home</Link>
              <Link to="#">Schedule</Link>
              <Link to="/edit-schedule">Edit-schedule</Link>
              {this.renderAuthLinks()}
            </nav>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth.authenticated,
    };
}

export default connect(mapStateToProps)(Navbar);
