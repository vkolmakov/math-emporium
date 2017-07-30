import React from 'react';

export default ({ children, noSidebar }) => (
    <div className={noSidebar ? '' : 'content'} id="main" tabIndex="-1">
        {children}
    </div>
);
