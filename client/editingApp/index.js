import React, { Component } from 'react';

import Sidebar from '../components/sidebar/index';

import { BASE_PATH } from './constants';

export default class EditingApp extends Component {
    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        const links = [
            ['locations', 'Locations'],
            ['courses', 'Courses'],
            ['tutors', 'Tutors'],
            ['schedules', 'Schedules'],
            ['schedules-overview', 'Schedules Overview'],
            ['tutors-overview', 'Tutors Overview'],
        ];

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        return (
            <div className="wrap">
              <Sidebar {...sidebarConfig}/>
              {this.props.children}
            </div>
        );
    }
}
