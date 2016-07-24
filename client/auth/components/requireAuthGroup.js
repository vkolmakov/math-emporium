import React, { Component } from 'react';
import { connect } from 'react-redux';

export default (requiredGroup) => (ComposedComponent) => {
    class Authentication extends Component {
        componentWillMount() {
            if (!this.props.authenticated || this.props.group < requiredGroup) {
                this.context.router.push('/signin');
            }
        }

        componentWillUpdate() {
            if (!this.props.authenticated || this.props.group < requiredGroup) {
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
            group: state.auth.group,
        };
    }

    Authentication.contextTypes = {
        router: React.PropTypes.object,
    };

    return connect(mapStateToProps)(Authentication);
};
