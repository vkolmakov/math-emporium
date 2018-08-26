import React, { Component } from "react";
import { BrowserRouter } from "react-router-dom";

import { ROUTE_BASE_PATHS, AUTH_GROUPS } from "@client/constants";
import RequireAuthGroup from "@client/auth/components/requireAuthGroup";

import App from "@client/rootApp/index";
import Home from "@client/rootApp/components/home/index";

import Route from "./Route";
import Redirect from "./Redirect";

function AsyncComponent(getComponent) {
    return class AsyncComponent extends Component {
        constructor(props) {
            super(props);
            this.state = { Component: this.Component };
        }

        componentWillMount() {
            if (!this.state.Component) {
                getComponent().then((Component) => {
                    this.setState({ Component });
                });
            }
        }

        render() {
            const { Component } = this.state;
            if (Component) {
                return <Component {...this.props} />;
            }
            return null;
        }
    };
}

const Editing = RequireAuthGroup(AUTH_GROUPS.employee)(
    AsyncComponent(() =>
        import("@client/editingApp/index").then((module) => module.default)
    )
);

const Auth = AsyncComponent(() =>
    import("@client/auth/index").then((module) => module.default)
);

const Managing = RequireAuthGroup(AUTH_GROUPS.employer)(
    AsyncComponent(() =>
        import("@client/managingApp/index").then((module) => module.default)
    )
);

const Scheduling = AsyncComponent(() =>
    import("@client/schedulingApp/index").then((module) => module.default)
);

export default class Router extends Component {
    render() {
        const { immediatelyRedirectTo } = this.props;

        let MaybeRedirect = () =>
            immediatelyRedirectTo ? (
                <Redirect to={immediatelyRedirectTo} />
            ) : (
                <span />
            );

        return (
            <BrowserRouter>
                <div>
                    <MaybeRedirect />
                    <Route path="/" component={App} />
                    <Route exact path="/" component={Home} />
                    <Route
                        path={`/${ROUTE_BASE_PATHS.EDIT}`}
                        component={Editing}
                    />
                    <Route
                        path={`/${ROUTE_BASE_PATHS.AUTH}`}
                        component={Auth}
                    />
                    <Route
                        path={`/${ROUTE_BASE_PATHS.MANAGE}`}
                        component={Managing}
                    />
                    <Route
                        path={`/${ROUTE_BASE_PATHS.SCHEDULE}`}
                        component={Scheduling}
                    />
                </div>
            </BrowserRouter>
        );
    }
}
