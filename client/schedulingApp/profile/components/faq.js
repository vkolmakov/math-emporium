import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoadingSpinner from '../../../components/loadingSpinner';

import { getFaqContent } from '../../../util/actions';

class Faq extends Component {
    componentDidMount() {
        if (!this.props.content) {
            this.props.getFaqContent();
        }
    }

    render() {
        const Content = () => !!this.props.content
              ? <div className="faq-content" dangerouslySetInnerHTML={{ __html: this.props.content }}></div>
              : <LoadingSpinner></LoadingSpinner>;

        return (
            <div className="faq">
              <h2>FAQ</h2>
              <Content></Content>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        content: state.util.settings.faqContent,
    };
}

export default connect(mapStateToProps, {
    getFaqContent,
})(Faq);
