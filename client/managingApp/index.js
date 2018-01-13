import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar/index';
import LoadingSpinner from '../components/loadingSpinner';
import MainContentWrap from '../components/mainContentWrap';

import { BASE_PATH } from './constants';

import { getUsers } from './users/actions';
import { getEvents } from './events/actions';
import { getSettings } from './settings/actions';

class ManagingApp extends Component {
    constructor(props) {
        super(props);
        this.state = { initialized: false };
    }

    componentDidMount() {
        return Promise.all([
            this.props.getUsers(),
            this.props.getEvents(),
            this.props.getSettings(),
        ]).then(() => this.setState({ initialized: true }));
    }

    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        const links = [
            ['users', 'Users'],
            ['events', 'Events'],
            ['settings', 'Settings'],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };


        let displayElems;

        if (!this.state.initialized) {
            displayElems = (<LoadingSpinner></LoadingSpinner>);
        } else if (this.props.children) {
            displayElems = this.props.children;
        } else {
            displayElems = (
                <div className="content">
                  <div className="middle-help-message-wrap">
                    <h1>Select an option</h1>
                  </div>
                </div>
            );
        }

        return (
            <MainContentWrap>
                <div className="wrap">
                    <Sidebar {...sidebarConfig}/>
                    {displayElems}
                </div>
            </MainContentWrap>
        );
    }
}

export default connect(null, {
    getUsers, getEvents, getSettings })(ManagingApp);
