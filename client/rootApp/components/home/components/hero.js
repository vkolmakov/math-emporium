import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Hero extends Component {
    constructor() {
        super();
        this.state = {
            focus: false,
        };
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    onMouseEnter() {
        this.setState({ focus: true });
    }

    onMouseLeave() {
        this.setState({ focus: false });
    }

    render() {
        return (
            <div className={this.state.focus ? 'hero-focus' : 'hero'}>
              <div className="hero-content">
                <h1>Tutoring at Wright</h1>
                <h2>Schedule your appointment today</h2>
                <div>
                  <Link to="/schedule"
                        onMouseEnter={this.onMouseEnter}
                        onMouseLeave={this.onMouseLeave}>Check out our schedule</Link>
                </div>
              </div>
            </div>
        );
    }
}
