import React, { Component } from "react";
import { connect } from "react-redux";

import { BASE_PATH } from "../constants";

import { getSubjects, deleteSubject } from "./actions";
import { getLocations, setCurrentLocation } from "../locations/actions";

import LoadingSpinner from "../../components/loadingSpinner";
import Table from "../../components/table/index";
import CreateSubjectForm from "./components/createSubjectForm";
import FilterControls from "../../components/filterControls";

import { selectTransformOptions } from "../utils";

class EditSubjects extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getSubjects();
    }

    render() {
        let { subjects, locations } = this.props;

        const { setCurrentLocation, deleteSubject } = this.props;

        if (!subjects.all) {
            return (
                <div className="content">
                    <LoadingSpinner />
                </div>
            );
        }

        if (locations.selected) {
            const selectedLocation = locations.selected;
            const filteredSubjects = subjects.all.filter(
                (subject) =>
                    subject.location &&
                    subject.location.id === selectedLocation.id,
            );
            subjects = {
                ...subjects,
                all: filteredSubjects,
            };
        }

        const locationsOptions = selectTransformOptions()(locations.all);

        const tableHeaders = [
            {
                dataKey: "name",
                label: "Name",
            },
            {
                dataKey: "location->name",
                label: "Location",
            },
        ];

        const tableActions = [
            {
                label: "Remove",
                action: deleteSubject,
                requestConfirmation: true,
            },
            {
                label: "Edit",
                action: `/${BASE_PATH}/subjects`,
            },
        ];

        return (
            <div className="content">
                <div className="content-nav">
                    <h2>Subjects</h2>
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
                <CreateSubjectForm locations={locations} subjects={subjects} />

                <div className="list-wrap right-col">
                    <Table
                        headers={tableHeaders}
                        data={subjects.all}
                        actions={tableActions}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        subjects: {
            all: state.subjects.all,
            error: state.subjects.error,
        },
        locations: {
            all: state.locations.all,
            selected: state.locations.selected,
        },
    };
}

export default connect(
    mapStateToProps,
    {
        getSubjects,
        getLocations,
        deleteSubject,
        setCurrentLocation,
    },
)(EditSubjects);
