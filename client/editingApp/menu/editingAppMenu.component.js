import React, { Component } from 'react';
import { Link } from 'react-router';

export default class EditingAppMenu extends Component {
    render() {
        const navButtonClass = 'pure-button pure-button-xlarge';
        return (
            <div className="container">
              <Link
                 to="/edit-schedule/locations"
                 className={navButtonClass}>Locations</Link>
              <Link
                 to="/edit-schedule/courses"
                 className={navButtonClass}>Courses</Link>
              <Link
                 to="/edit-schedule/tutors"
                 className={navButtonClass}>Tutors</Link>
              <Link
                 to="/edit-schedule/schedules"
                 className={navButtonClass}>Schedules</Link>
            </div>
        );
    }
}
