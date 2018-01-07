import React, { Component } from 'react';
import { Link } from 'react-router';

import { createClassName } from '../../utils';

export default class Sidebar extends Component {
    constructor(props) {
        super(props);
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
        this.markAsSelectedOnSidebar(event.currentTarget.href);
    }

    markAsSelectedOnSidebar(path) {
        this.setState({ selected: path.split('/').pop() });
    }

    renderLink(path, text, BASE_PATH) {
        const url = `/${BASE_PATH}/${path}`;
        return (
            <Link to={url}
                  onClick={this.handleClick}
                  className={'sidebar-link'}>
              {text}
            </Link>
        );
    }

    render() {
        const { BASE_PATH, links } = this.props;
        const isCurrentlySelected = (path) => this.state.selected === path;

        return (
            <div className="sidebar">
              <ul className="sidebar-container">
                {links.map(([path, text]) => (
                    <li className={createClassName(['sidebar-item', isCurrentlySelected(path) ? 'selected' : ''])}
                        key={path}>{this.renderLink(path, text, BASE_PATH)}</li>
                ))}
              </ul>
              {this.props.children}
            </div>
        );
    }
}
