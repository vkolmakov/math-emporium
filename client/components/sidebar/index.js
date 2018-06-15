import React, { Component } from 'react';

import Link from '@client/components/Link';
import withRouterContext from '@client/routing/withRouterContext';
import { createClassName } from '@client/utils';

class Sidebar extends Component {
    getSidebarEntryId(path) {
        return path.split('/').pop();
    }

    renderLink(entry, text, BASE_PATH) {
        const url = `/${BASE_PATH}/${entry}`;
        return (
            <Link to={url}
                  data-text={text}
                  className={'sidebar-link'}>
              {text}
            </Link>
        );
    }

    render() {
        const { BASE_PATH, links, location } = this.props;
        const currentRouterPath = location.pathname;
        const currentlySelectedEntry = this.getSidebarEntryId(currentRouterPath);
        const isCurrentlySelectedEntry = (entry) => currentlySelectedEntry === entry;

        return (
            <div className="sidebar">
              <ul className="sidebar-container">
                {links.map(([entry, text]) => (
                    <li className={createClassName(['sidebar-item', isCurrentlySelectedEntry(entry) ? 'selected' : ''])}
                        key={entry}>{this.renderLink(entry, text, BASE_PATH)}</li>
                ))}
              </ul>
              {this.props.children}
            </div>
        );
    }
}

export default withRouterContext(Sidebar);
