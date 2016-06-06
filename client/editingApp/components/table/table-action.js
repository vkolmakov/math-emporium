import React from 'react';

export default ({ action, datum }) => {
    const param = datum.id;
    let onClick;
    if (typeof action.action === 'string') {
        // got a URL
        onClick = () => {
            console.log('link clicked!', param);
        };
    } else if (typeof action.action === 'function') {
        // got a regular action
        onClick = () => {
            action.action.call(null, param);
        };
    }

    return (
        <td onClick={onClick}>
          <a href="#">
            {action.label}
          </a>
        </td>
    );
};
