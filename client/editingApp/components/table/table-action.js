import React from 'react';
import { Link } from 'react-router';

export default ({ action, datum }) => {
    const param = datum.id;
    let onClick = () => {};
    let url = '#';

    if (typeof action.action === 'string') {
        // got a URL
        url = `${action.action}/${param}`;
    } else if (typeof action.action === 'function') {
        // got a regular action
        onClick = () => {
            action.action.call(null, param);
        };
    }

    return (
        <td onClick={onClick}>
          <Link to={url}>
            {action.label}
          </Link>
        </td>
    );
};
