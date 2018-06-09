import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import Sidebar from '@client/components/sidebar/index';
import MainContentWrap from '@client/components/mainContentWrap';
import { ROUTE_BASE_PATHS, AUTH_GROUPS } from '@client/constants';

import EditLocations from './locations/index';
import LocationDetail from './locations/components/locationDetail';

import EditSubjects from './subjects/index';
import SubjectDetail from './subjects/components/subjectDetail';

import EditCourses from './courses/index';
import CourseDetail from './courses/components/courseDetail';

const BASE_PATH = ROUTE_BASE_PATHS.EDIT;

const IndexComponent = () => (
    <div className="content">
      <div className="middle-help-message-wrap">
        <h1>Select an option</h1>
      </div>
    </div>
);

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

        return (
            <MainContentWrap>
                <div className="wrap">
                    <Sidebar {...sidebarConfig} />
                    <Switch>
                      <Route exact path={`/${BASE_PATH}`} component={IndexComponent}></Route>
                      <Route exact path={`/${BASE_PATH}/locations`} component={EditLocations}></Route>
                      <Route exact path={`/${BASE_PATH}/locations/:id`} component={LocationDetail}></Route>
                      <Route exact path={`/${BASE_PATH}/subjects`} component={EditSubjects} />
                      <Route exact path={`/${BASE_PATH}/subjects/:id`} component={SubjectDetail} />
                      <Route exact path={`/${BASE_PATH}/courses`} component={EditCourses} />
                      <Route exact path={`/${BASE_PATH}/courses/:id`} component={CourseDetail} />
                    </Switch>
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
