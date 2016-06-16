import React, { Component, PropTypes } from 'react';

class EditingApp extends Component {
    render() {
        return (
            <div className="wrap">
              <div className="sidebar">
                <button
                   className="pure-button pure-button-xlarge"
                   onClick={this.context.router.goBack}>Back</button>
              </div>
              {this.props.children}
            </div>
        );
    }
}

EditingApp.contextTypes = {
    router: PropTypes.object,
};

export default EditingApp;
