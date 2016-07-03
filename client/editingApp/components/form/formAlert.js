import React from 'react';

export default ({ error }) => {
    let AlertComponent;
    if (error) {
        AlertComponent = (
            <span className="form-help">
              <strong>Oops! </strong>{error}
            </span>
        );
    } else {
        AlertComponent = <span></span>;
    }

    return AlertComponent;
};
