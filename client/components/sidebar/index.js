import React, { Component } from 'react';
import { Link } from 'react-router';

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

    renderLink(path, text, BASE_PATH) {
        const url = `/${BASE_PATH}/${path}`;
        return (
            <Link to={url}
                  onClick={this.handleClick}
                  className={this.state.selected === path ? 'selected' : ''}>
              {text}
            </Link>
        );
    }

    render() {
        const { BASE_PATH, links } = this.props;

        return (
            <div className="sidebar">
              <ul>
                {links.map(([path, text]) => (
                    <li key={path}>{this.renderLink(path, text, BASE_PATH)}</li>
                ))}
              </ul>
            </div>
        );
    }
}
