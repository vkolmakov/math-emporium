import React from "react";

export default ({ success }) => {
    if (success) {
        return <span className="form-success">Saved!</span>;
    }
    return <span />;
};
