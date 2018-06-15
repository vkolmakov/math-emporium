import React, { Component } from "react";
import { connect } from "react-redux";

import { BASE_PATH } from "../constants";

import { getCourses, deleteCourse } from "./actions";
import { getLocations, setCurrentLocation } from "../locations/actions";
import { getSubjects } from "../subjects/actions";

import LoadingSpinner from "../../components/loadingSpinner";
import Table from "../../components/table/index";
import CreateCourseForm from "./components/createCourseForm";
import FilterControls from "../../components/filterControls";

import { selectTransformOptions } from "../utils";

class EditCourses extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
        this.props.getSubjects();
    }

    render() {
        let { courses, locations, subjects } = this.props;

        const { setCurrentLocation, deleteCourse } = this.props;

        if (!courses.all) {
            return (
                <div className="content">
                    <LoadingSpinner />
                </div>
            );
        }

        if (locations.selected) {
            const selectedLocation = locations.selected;
            const filteredCourses = courses.all.filter(
                (course) =>
                    course.location &&
                    course.location.id === selectedLocation.id,
            );
            courses = {
                ...courses,
                all: filteredCourses,
            };
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        const tableHeaders = [
            {
                dataKey: "code",
                label: "Code",
            },
            {
                dataKey: "subject->name",
                label: "Subject",
            },
            {
                dataKey: "name",
                label: "Name",
            },
            {
                dataKey: "hexColor",
                label: "Color",
            },
            {
                dataKey: "location->name",
                label: "Location",
            },
        ];

        const tableActions = [
            {
                label: "Remove",
                action: deleteCourse,
                requestConfirmation: true,
            },
            {
                label: "Edit",
                action: `/${BASE_PATH}/courses`,
            },
        ];

        return (
            <div className="content">
                <div className="content-nav">
                    <h2>Courses</h2>
                    <FilterControls
                        options={locationsOptions}
                        currentValue={
                            locations.selected ? locations.selected.id : null
                        }
                        onChange={setCurrentLocation.bind(this)}
                        label="Filter by location"
                        placeholder="Select..."
                    />
                </div>
                <CreateCourseForm
                    locations={locations}
                    subjects={subjects}
                    courses={courses}
                />

                <div className="list-wrap right-col">
                    <Table
                        headers={tableHeaders}
                        data={courses.all}
                        actions={tableActions}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        courses: {
            all: state.courses.all,
            error: state.courses.error,
        },
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
        subjects: {
            all: state.subjects.all,
            error: state.subjects.error,
        },
    };
}

export default connect(
    mapStateToProps,
    {
        getCourses,
        getLocations,
        deleteCourse,
        setCurrentLocation,
        getSubjects,
    },
)(EditCourses);
