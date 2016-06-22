import React, { Component } from 'react';

import Navbar from './components/navbar/index';

export default class App extends Component {
    render() {
        return (
            <div>
              <Navbar />
              {this.props.children}
            </div>
        );
    }
}
