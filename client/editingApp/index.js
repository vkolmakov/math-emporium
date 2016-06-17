import React, { Component } from 'react';

import Sidebar from './components/sidebar/index';

export default class EditingApp extends Component {
    render() {
        return (
            <div className="wrap">
              <Sidebar />
              {this.props.children}
            </div>
        );
    }
}
