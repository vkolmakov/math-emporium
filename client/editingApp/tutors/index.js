import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';

import { getLocations, setCurrentLocation } from '../locations/actions';
import { getTutors, deleteTutor } from './actions';
import { getCourses } from '../courses/actions';

import LoadingSpinner from '../../components/loadingSpinner';
import Table from '../../components/table/index';
import CreateTutorForm from './components/createTutorForm';
import FilterControls from '../../components/filterControls';

import { selectTransformOptions } from '../utils';

class EditTutors extends Component {
    componentWillMount() {
        this.props.getTutors();
        this.props.getLocations();
        this.props.getCourses();
    }

    render() {
        let { tutors, locations, courses } = this.props;

        const { setCurrentLocation, deleteTutor } = this.props;

        if (!tutors.all) {
            return (
                <div className="content">
                  <LoadingSpinner />
                </div>
            );
        }

        if (locations.selected) {
            const selectedLocation = locations.selected;
            const [filteredTutors, filteredCourses] = [tutors.all, courses.all].map(
                list => list.filter(
                    elem => elem.location && elem.location.id == selectedLocation.id
                )
            );

            tutors = {
                ...tutors,
                all: filteredTutors,
            };

            courses = {
                ...courses,
                all: filteredCourses,
            };
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        const tableHeaders = [
            {
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
                action: deleteTutor,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/tutors`,
            },
        ];

        return (
            <div className="content">
              <div className="content-nav">
                <h2>Tutors</h2>
                <FilterControls options={locationsOptions}
                                currentValue={locations.selected ? locations.selected.id : ''}
                                onChange={setCurrentLocation.bind(this)}
                                placeholder={'Filter by location...'} />
              </div>
              <CreateTutorForm locations={locations}
                               courses={courses}
                               tutors={tutors} />

              <div className="list-wrap right-col">
                <Table headers={tableHeaders}
                     data={tutors.all}
                     actions={tableActions} />
              </div>

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
    { getLocations, setCurrentLocation, getTutors, deleteTutor, getCourses }
)(EditTutors);
