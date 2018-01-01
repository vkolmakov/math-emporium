import React, { Component } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../components/sidebar/index';
import MainContentWrap from '../components/mainContentWrap';
import { BASE_PATH, AUTH_GROUPS } from './constants';

class EditingApp extends Component {
    render() {
        const currPath = this.props.location.pathname;
        const selected = currPath.split('/').pop();

        let links;
        switch (this.props.authGroup) {
        case AUTH_GROUPS.admin:
        case AUTH_GROUPS.employer:
            links = [
                ['locations', 'Locations'],
                ['subjects', 'Subjects'],
                ['courses', 'Courses'],
                ['tutors', 'Tutors'],
                ['schedules', 'Schedules'],
                ['schedules-overview', 'Schedules Overview'],
                ['tutors-overview', 'Tutors Overview'],
            ];
            break;
        case AUTH_GROUPS.employee:
        default:
            links = [
                ['schedules-overview', 'Schedules Overview'],
                ['tutors-overview', 'Tutors Overview'],
            ];
            break;
        }

        const sidebarConfig = {
            links,
            BASE_PATH,
            selected: selected !== BASE_PATH ? selected : null,
        };

        const displayElems = this.props.children || (
            <div className="content">
              <div className="middle-help-message-wrap">
                <h1>Select an option</h1>
              </div>
            </div>
        );

        return (
            <MainContentWrap>
                <div className="wrap">
                    <Sidebar {...sidebarConfig} />
                    {displayElems}
                </div>
            </MainContentWrap>
        );
    }
}

function mapStateToProps(state) {
    return {
        authGroup: state.auth.group,
    };
}

export default connect(mapStateToProps)(EditingApp);
