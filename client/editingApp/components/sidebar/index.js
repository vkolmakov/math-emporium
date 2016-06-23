import React, { Component } from 'react';
import { Link } from 'react-router';

import { BASE_PATH } from '../../constants';

export default class Sidebar extends Component {
    constructor() {
        super();
        this.state = {
            selected: null,
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillMount() {
        this.setState({
            selected: this.props.selected,
        });
    }

    handleClick(event) {
        const target = event.currentTarget.href.split('/').pop();
        this.setState({ selected: target });
    }

    renderLink(path, text) {
        return (
            <Link to={`/${BASE_PATH}/${path}`}
                  onClick={this.handleClick}
                  className={this.state.selected === path ? 'selected' : ''}>
              {text}
            </Link>
        );
    }

    render() {
        const topList = [
            ['locations', 'Locations'],
            ['courses', 'Courses'],
            ['tutors', 'Tutors'],
            ['schedules', 'Schedules'],
        ];

        const bottomList = [
            ['schedules-overview', 'Schedules Overview'],
            ['tutors-overview', 'Tutors Overview'],
        ];

        return (
            <div className="sidebar">
              <ul>
                {topList.map(([path, text]) => (
                    <li key={path}>{this.renderLink(path, text)}</li>
                ))}
            </ul>
                <ul>
                {bottomList.map(([path, text]) => (
                    <li key={path}>{this.renderLink(path, text)}</li>
                ))}
            </ul>
            </div>
        );
    }
}
