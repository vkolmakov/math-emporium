import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';
import { getCourses } from '../actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import UpdateCourseForm from './updateCourseForm';

class CourseDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
    }

    render() {
        let { locations, courses } = this.props;

        const { id } = this.props.params;

        const selectedCourse = courses.all.find(
            course => course.id == id
        );

        if (!selectedCourse) {
            return <LoadingSpinner />;
        }

        return (
            <div className="content">
              <UpdateCourseForm locations={locations}
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
    };
}

export default connect(
    mapStateToProps,
    { getLocations, getCourses }
)(CourseDetail);
