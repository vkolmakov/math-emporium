import React from 'react';

export default ({ content }) => {
    const Content = () => (
        <div className="faq-content" dangerouslySetInnerHTML={{ __html: content }}></div>
    );

    return (
        <div className="faq">
          <Content></Content>
        </div>
    );
};
