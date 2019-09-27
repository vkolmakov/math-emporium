import React from "react";
import { connect } from "react-redux";

class CourseSelectionAutocomplete extends React.Component {
    render() {
        return (
            <div className="course-selection-autocomplete">
                <input />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(CourseSelectionAutocomplete);
