import React, { Component } from 'react';
import { connect } from 'react-redux';

import { hideAnnouncement } from '../../util/actions';

class Announcement extends Component {
    render() {
        const { isAnnouncementDisplayed, announcement } = this.props;

        if (!isAnnouncementDisplayed) {
            return (<span></span>);
        }

        return (
            <div className="announcement" style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}>
              <div className="announcement-content" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>
              <button onClick={this.props.hideAnnouncement.bind(this, announcement.content)} className="announcement-hide-button"></button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        isAnnouncementDisplayed: state.util.isAnnouncementDisplayed,
        announcement: {
            content: state.util.settings.announcementContent,
            backgroundColor: state.util.settings.announcementBackgroundColor,
            textColor: state.util.settings.announcementTextColor,
        },
    };
}

export default connect(mapStateToProps, {
    hideAnnouncement,
})(Announcement);
