import React from 'react';
import { Link } from 'react-router';

export default ({ action, datum }) => {
    const param = datum.id;
    let onClick;
    let url;
    let LinkElem;

    if (typeof action.action === 'string') {
        // got a URL
        url = `${action.action}/${param}`;
        onClick = () => {};
        LinkElem = () => (
            <Link to={url}>
              {action.label}
            </Link>
        );
    } else if (typeof action.action === 'function') {
        // got a regular action
        url = '#';
        onClick = () => {
            action.action.call(null, param);
        };
        LinkElem = () => (
            <a href={url}>
              {action.label}
            </a>
        );
    }

    return (
        <td onClick={onClick}
            className="table-action">
          <LinkElem />
        </td>
    );
};
