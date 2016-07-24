import React from 'react';

export default ({ error }) => {
    let AlertComponent;
    if (error) {
        AlertComponent = (
            <p className="form-help">
              <strong>Oops! </strong>{error}
            </p>
        );
    } else {
        AlertComponent = <span></span>;
    }

    return AlertComponent;
};
