import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Hero extends Component {
    constructor() {
        super();
        this.state = {
            focus: true,
        };
    }

    render() {
        return (
            <div className={this.state.focus ? 'hero-focus' : 'hero'}>
              <div className="hero-content">
                <h1>Tutoring @ Wright</h1>
                <h2>Study with us!</h2>
                <div>
                  <Link to="/schedule">Schedule appointment</Link>
                </div>
              </div>
            </div>
        );
    }
}
