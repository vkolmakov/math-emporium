import React, { Component } from 'react';
import { connect } from 'react-redux';

class OpenSpots extends Component {
    render() {
        const { location, course, startDate } = this.props;

        let errorMessage;

        if (!startDate) {
            errorMessage = 'Select a location';
        } else if (!location) {
            errorMessage = 'Select a location';
        } else if (!course) {
            errorMessage = 'Select a course';
        }

        if (errorMessage) {
            return (
                <div className="middle-help-message-wrap">
                  <h1>{errorMessage}</h1>
                </div>
            );
        }

        return (
            <div className="middle-help-message-wrap">
              <h1>Booya!</h1>
            </div>
        );
    }
}

export default connect()(OpenSpots);
