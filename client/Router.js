import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { BASE_PATH, AUTH_GROUPS } from '@client/constants';
import RequireAuthGroup from '@client/auth/components/requireAuthGroup';

import App from '@client/rootApp/index';
import Home from '@client/rootApp/components/home/index';

function AsyncComponent(getComponent) {
    return class AsyncComponent extends Component {
        constructor(props) {
            super(props);
            this.state = { Component: this.Component };
        }

        componentWillMount() {
            if (!this.state.Component) {
                getComponent().then((Component) => { this.setState({ Component }); });
            }
        }

        render() {
            const { Component } = this.state;
            if (Component) {
                return (<Component {...this.props} />);
            }
            return null;
        }
    };
}

const Editing = RequireAuthGroup(AUTH_GROUPS.employee)(
    AsyncComponent(() => System.import('./editingApp/index').then((module) => module.default))
);

export default class Router extends Component {
    render() {
        return (
            <BrowserRouter>
              <div>
                <Route path="/" component={App}></Route>
                <Route exact path="/" component={Home}></Route>
                <Route path="/edit-schedule" component={Editing}></Route>

              </div>
            </BrowserRouter>
        );
    }
}
