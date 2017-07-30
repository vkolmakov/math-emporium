import React, { Component } from 'react';

import Navbar from './components/navbar/index';
import SkipLinks from './components/skipLinks';

export default class App extends Component {
    render() {
        return (
            <div>
                <SkipLinks />
                <Navbar />
                {this.props.children}
            </div>
        );
    }
}
