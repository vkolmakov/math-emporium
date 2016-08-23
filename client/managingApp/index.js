import React, { Component } from 'react';

import Sidebar from '../components/sidebar/index';
import { BASE_PATH } from './constants';

class ManagingApp extends Component {
    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        const links = [
            ['users', 'Users'],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        const displayElems = this.props.children || (
            <div className="content">
              <div className="middle-help-message-wrap">
                <h1>Select an option</h1>
              </div>
            </div>
        );

        return (
            <div className="wrap">
              <Sidebar {...sidebarConfig}/>
              {displayElems}
            </div>
        );
    }
}

export default ManagingApp;