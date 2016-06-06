import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getLocations } from '../locations/actions';
import { getTutors, deleteTutor } from './actions';
import { getCourses } from '../courses/actions';

import Table from '../components/table/index';
import CreateTutorForm from './form.component';


class EditTutors extends Component {
    componentWillMount() {
        this.props.getTutors();
        this.props.getLocations();
        this.props.getCourses();
    }

    render() {
        const { tutors, locations, courses } = this.props;

        if (!tutors.all) {
            return (
                <div>Loading...</div>
            );
        }

        const tableHeaders = [
            {
                dataKey: 'id',
                label: 'ID',
            }, {
                dataKey: 'name',
                label: 'Name',
            }, {
                dataKey: 'location->name',
                label: 'Location',
            }, {
                dataKey: 'courses->code',
                label: 'Courses',
            },
        ];

        const tableActions = [
            {
                label: 'Remove',
                action: this.props.deleteTutor,
            }, {
                label: 'Edit',
                action: '/editing-schedule/tutors',
            },
        ];

        return (
            <div className="content">
              <CreateTutorForm locations={locations}
                               courses={courses} />

              <Table headers={tableHeaders}
                     data={tutors.all}
                     actions={tableActions}/>
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
    { getLocations, getTutors, deleteTutor, getCourses }
)(EditTutors);
