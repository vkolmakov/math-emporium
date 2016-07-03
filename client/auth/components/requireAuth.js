import React, { Component } from 'react';
import { connect } from 'react-redux';

export default (ComposedComponent) => {
    class Authentication extends Component {
        componentWillMount() {
            if (!this.props.authenticated) {
                this.context.router.push('/signin');
            }
        }

        componentWillUpdate() {
            if (!this.props.authenticated) {
                this.context.router.push('/signin');
            }
        }

        render() {
            return <ComposedComponent {...this.props} />;
        }
    }

    function mapStateToProps(state) {
        return {
            authenticated: state.auth.authenticated,
        };
    }

    Authentication.contextTypes = {
        router: React.PropTypes.object,
    };

    return connect(mapStateToProps)(Authentication);
};
