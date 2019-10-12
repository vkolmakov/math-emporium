import React, { useState } from "react";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try typing in MATH125 or Chemistry";

const getSuggestions = (value, courses) => {
    const inputValue = value.trim().toLowerCase();
    /**
     * Handles the case where someone entered an input
     * that ends with a digit, which is likely an attempt
     * to get the course by its code. Following items will match:
     *
     * "math 125" -> ["math", " ", "125"]
     * "math-125" -> ["math", "-", "125"]
     * "chem201"  -> ["chem", "",  "201"]
     */
    const regex = /([a-z]+)(.*?)(\d+)/;
    // inputValue is lowercased prior to matching
    const splitCourseCodeMatchGroup = regex.exec(inputValue);
    let isSplitCourseCodeInput = splitCourseCodeMatchGroup !== null;
    const inputLength = inputValue.length;

    const isMatchingInput = (course) => {
        if (isSplitCourseCodeInput) {
            // whatever letters come before the number
            const courseNamePortion = splitCourseCodeMatchGroup[1];
            // whatever digits the query ends with
            const courseNumberPortion = splitCourseCodeMatchGroup[3];
            return (
                course.code.toLowerCase().includes(courseNamePortion) &&
                course.code.toLowerCase().includes(courseNumberPortion)
            );
        }

        return (
            course.code.toLowerCase().includes(inputValue) ||
            course.name.toLowerCase().includes(inputValue)
        );
    };

    return inputLength === 0 ? [] : courses.filter(isMatchingInput);
};

function courseToString(course) {
    return `${course.code}: ${course.name}`;
}

function Suggestion(course) {
    return (
        <div className="course-selection-autocomplete__suggestion-option">
            {courseToString(course)}
        </div>
    );
}

function CourseSelectionAutocomplete(props) {
    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState("");

    return (
        <div className="course-selection-autocomplete">
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={({ value }) =>
                    setSuggestions(getSuggestions(value, props.courses))
                }
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={(value) => courseToString(value)}
                renderSuggestion={Suggestion}
                inputProps={{
                    placeholder: SEARCH_PLACEHOLDER,
                    value: value,
                    onChange: (_event, { newValue }) => {
                        setValue(newValue);
                        // TODO: dispatch an action to move into scheduling
                    },
                }}
            />
        </div>
    );
}

CourseSelectionAutocomplete.propTypes = {
    courses: propTypes.arrayOf(
        propTypes.shape({
            code: propTypes.string,
            id: propTypes.number,
            name: propTypes.string,
            subject: propTypes.shape({ id: propTypes.number }),
        })
    ),
};

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(CourseSelectionAutocomplete);
