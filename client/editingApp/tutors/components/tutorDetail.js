import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';
import { getCourses } from '../../courses/actions';
import { getTutors } from '../actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import UpdateTutorForm from './updateTutorForm';

class TutorDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
        this.props.getTutors();
    }

    render() {
        let { locations, courses, tutors } = this.props;

        const { id } = this.props.match.params;

        const selectedTutor = tutors.all.find(
            tutor => tutor.id == id
        );

        if (!selectedTutor) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        let selectedLocation;
        if (locations.selected) {
            // grab from the state
            selectedLocation = locations.selected;
        } else {
            selectedLocation = locations.all.find(
                location => location.id == selectedTutor.location.id
            );
        }
        const [filteredCourses] = [courses.all].map(
            list => list.filter(
                elem => elem.location.id == selectedLocation.id
            )
        );

        courses = {
            ...courses,
            all: filteredCourses,
        };

        return (
            <div className="content">
              <UpdateTutorForm locations={locations}
                               courses={courses}
                               selectedTutor={selectedTutor}
                               tutors={tutors} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
        tutors: {
            all: state.tutors.all,
            error: state.tutors.error,
        },
        courses: {
            all: state.courses.all,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, getCourses, getTutors }
)(TutorDetail);
