import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';
import { getSubjects } from '../../subjects/actions';
import { getCourses } from '../actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import UpdateCourseForm from './updateCourseForm';

class CourseDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
        this.props.getSubjects();
    }

    render() {
        let { locations, courses, subjects } = this.props;

        const { id } = this.props.params;

        const selectedCourse = courses.all.find(
            course => course.id == id
        );

        if (!selectedCourse) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="content">
              <UpdateCourseForm locations={locations}
                                subjects={subjects}
                                selectedCourse={selectedCourse}
                                courses={courses}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
        },
        courses: {
            all: state.courses.all,
            error: state.courses.error,
        },
        subjects: {
            all: state.subjects.all,
            error: state.subjects.error,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, getCourses, getSubjects }
)(CourseDetail);
