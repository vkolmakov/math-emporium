import React from 'react';

export default ({ height }) => {
    const style = {
        margin: !!height ? `${height} auto` : (void 0)
    };

    return (
        <div className="loading" style={style}></div>
    );
}
