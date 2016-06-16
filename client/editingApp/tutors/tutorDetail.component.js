import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../locations/actions';
import { getCourses } from '../courses/actions';
import { getTutors } from './actions';

import LoadingSpinner from '../components/loadingSpinner';
import UpdateTutorForm from './updateTutorForm.component';

class TutorDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
        this.props.getTutors();
    }

    render() {
        const { locations, courses, tutors } = this.props;

        const { id } = this.props.params;

        const selectedTutor = tutors.all.find(
            tutor => tutor.id == id
        );

        if (!selectedTutor) {
            return <LoadingSpinner />;
        }

        return (
            <div className="content">
              <UpdateTutorForm locations={locations}
                               courses={courses}
                               selectedTutor={selectedTutor} />
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
