import React, { Component } from 'react';

import SkipLinks from './components/skipLinks';
import Announcement from './components/announcement';
import Navbar from './components/navbar/index';

export default class App extends Component {
    render() {
        return (
            <div>
              <SkipLinks></SkipLinks>
              <Announcement></Announcement>
              <Navbar></Navbar>
              {this.props.children}
            </div>
        );
    }
}
