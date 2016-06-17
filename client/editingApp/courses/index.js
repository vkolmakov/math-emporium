import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BASE_PATH } from '../constants';

import { getCourses, deleteCourse } from './actions';
import { getLocations, setCurrentLocation } from '../locations/actions';

import LoadingSpinner from '../components/loadingSpinner';
import Table from '../components/table/index';
import CreateCourseForm from './components/createCourseForm';
import FilterControls from '../components/filterControls';

import { selectTransformOptions } from '../utils';

class EditCourses extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
    }

    render() {
        let { courses, locations } = this.props;

        const { setCurrentLocation, deleteCourse } = this.props;

        if (!courses.all) {
            return (
                <LoadingSpinner />
            );
        }

        if (locations.selected) {
            const selectedLocation = locations.selected;
            const filteredCourses = courses.all.filter(
                course => course.location.id === selectedLocation.id
            )
            courses = {
                ...courses,
                all: filteredCourses
            };
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        const tableHeaders = [
            {
                dataKey: 'code',
                label: 'Code',
            }, {
                dataKey: 'name',
                label: 'Name',
            }, {
                dataKey: 'hexColor',
                label: 'Color',
            }, {
                dataKey: 'location->name',
                label: 'Location',
            },
        ];

        const tableActions = [
            {
                label: 'Remove',
                action: deleteCourse,
            }, {
                label: 'Edit',
                action: `/${BASE_PATH}/courses`,
            },
        ];

        return (
            <div className="content">
              <FilterControls options={locationsOptions}
                              currentValue={locations.selected ? locations.selected.id : null}
                              onChange={setCurrentLocation.bind(this)}
                              placeholder={'Filter by location...'} />

              <CreateCourseForm locations={locations} />

              <Table headers={tableHeaders}
                     data={courses.all}
                     actions={tableActions} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        courses: {
            all: state.courses.all,
        },
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
    };
}

export default connect(mapStateToProps, {
    getCourses,
    getLocations,
    deleteCourse,
    setCurrentLocation,
})(EditCourses);
