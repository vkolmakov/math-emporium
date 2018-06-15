import React, { Component } from "react";

import SkipLinks from "./components/skipLinks";
import Announcement from "./components/announcement";
import Navbar from "./components/navbar/index";

export default class App extends Component {
    render() {
        return (
            <div>
                <SkipLinks />
                <Announcement />
                <Navbar />
                {this.props.children}
            </div>
        );
    }
}
