import React from 'react';

export default ({ error }) => {
    let AlertComponent;
    if (error) {
        AlertComponent = (
            <span className="form-help">
              {error}
            </span>
        );
    } else {
        AlertComponent = <span></span>;
    }

    return AlertComponent;
};
