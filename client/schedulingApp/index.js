import React, { Component } from 'react';

import Sidebar from '../components/sidebar';
import { BASE_PATH } from './constants';

export default class SchedulingApp extends Component {
    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        const links = [
            ['show', 'Show Schedule'],
            ['profile', 'My Profile'],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        return (
            <div className="wrap">
              <Sidebar {...sidebarConfig} />
              {this.props.children}
            </div>
        );
    }
}
