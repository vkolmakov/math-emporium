import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../../locations/actions';
import { getSubjects } from '../actions';

import LoadingSpinner from '../../../components/loadingSpinner';
import UpdateSubjectForm from './updateSubjectForm';

class SubjectDetail extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getSubjects();
    }

    render() {
        let { locations, subjects } = this.props;

        const { id } = this.props.match.params;

        const selectedSubject = subjects.all.find(
            subject => subject.id == id
        );

        if (!selectedSubject) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        return (
            <div className="content">
              <UpdateSubjectForm locations={locations}
                                selectedSubject={selectedSubject}
                                subjects={subjects}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.locations.all,
        },
        subjects: {
            all: state.subjects.all,
            error: state.subjects.error,
        },
    };
}

export default connect(
    mapStateToProps,
    { getLocations, getSubjects }
)(SubjectDetail);
