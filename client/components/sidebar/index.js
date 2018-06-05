import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from '@client/components/Link';

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
        const { BASE_PATH, links, currentRouterPath } = this.props;
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

function mapStateToProps(state) {
    return {
        currentRouterPath: state.util.currentRouterPath,
    };
}

export default connect(mapStateToProps, null)(Sidebar);
