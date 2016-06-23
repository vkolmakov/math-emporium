import React, { Component } from 'react';

import Sidebar from './components/sidebar/index';

import { BASE_PATH } from './constants';

export default class EditingApp extends Component {
    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        return (
            <div className="wrap">
              <Sidebar selected={selected !== BASE_PATH ? selected : null}/>
              {this.props.children}
            </div>
        );
    }
}
