import React, { Component } from "react";
import { connect } from "react-redux";

import Route from "@client/routing/Route";
import Switch from "@client/routing/Switch";

import Sidebar from "@client/components/sidebar/index";
import LoadingSpinner from "@client/components/loadingSpinner";
import MainContentWrap from "@client/components/mainContentWrap";

import { ROUTE_BASE_PATHS } from "@client/constants";
import { LATEST_EVENT_LIMIT_DEFAULT } from "./constants";

import { getUsers } from "./users/actions";
import { getEvents } from "./events/actions";
import { getSettings } from "./settings/actions";
import { getErrorEvents } from "./errorEvents/actions";

import ManageUsers from "./users/index";
import UserDetail from "./users/components/userDetail";

import ManageEvents from "./events/index";

import ManageErrorEvents from "./errorEvents/index";

import ManageSettings from "./settings/index";

const BASE_PATH = ROUTE_BASE_PATHS.MANAGE;

const IndexComponent = () => (
    <div className="content">
        <div className="middle-help-message-wrap">
            <h1>Select an option</h1>
        </div>
    </div>
);

class ManagingApp extends Component {
    constructor(props) {
        super(props);
        this.state = { initialized: false };
    }

    componentDidMount() {
        return Promise.all([
            this.props.getUsers(),
            this.props.getEvents(LATEST_EVENT_LIMIT_DEFAULT),
            this.props.getSettings(),
            this.props.getErrorEvents(),
        ]).then(() => this.setState({ initialized: true }));
    }

    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split("/").pop();

        const links = [
            ["users", "Users"],
            ["events", "Events"],
            ["error-events", "Error Events"],
            ["settings", "Settings"],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        if (!this.state.initialized) {
            return <LoadingSpinner />;
        }

        return (
            <MainContentWrap>
                <div className="wrap">
                    <Sidebar {...sidebarConfig} />
                    <Switch>
                        <Route
                            exact
                            path={`/${BASE_PATH}`}
                            component={IndexComponent}
                        />
                        <Route
                            exact
                            path={`/${BASE_PATH}/users`}
                            component={ManageUsers}
                        />
                        <Route
                            exact
                            path={`/${BASE_PATH}/users/:id`}
                            component={UserDetail}
                        />
                        <Route
                            exact
                            path={`/${BASE_PATH}/events`}
                            component={ManageEvents}
                        />
                        <Route
                            exact
                            path={`/${BASE_PATH}/error-events`}
                            component={ManageErrorEvents}
                        />
                        <Route
                            exact
                            path={`/${BASE_PATH}/settings`}
                            component={ManageSettings}
                        />
                    </Switch>
                </div>
            </MainContentWrap>
        );
    }
}

export default connect(
    null,
    {
        getUsers,
        getEvents,
        getSettings,
        getErrorEvents,
    },
)(ManagingApp);
