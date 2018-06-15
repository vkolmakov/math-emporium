import React from "react";

export default ({ content }) => {
    const Content = () => (
        <div
            className="faq-content"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );

    return (
        <div className="faq">
            <Content />
        </div>
    );
};
