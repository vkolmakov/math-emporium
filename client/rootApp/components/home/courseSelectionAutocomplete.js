import React, { useState } from "react";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try typing in MATH125 or Chemistry";

const getSuggestions = (value, courses) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    const isMatchingInput = (course) =>
        course.code.toLowerCase().includes(inputValue) ||
        course.name.toLowerCase().includes(inputValue);

    return inputLength === 0 ? [] : courses.filter(isMatchingInput);
};
function Suggestion(course) {
    return (
        <div>
            {course.code}: {course.name}
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
                getSuggestionValue={(value) => value.code}
                renderSuggestion={Suggestion}
                inputProps={{
                    placeholder: SEARCH_PLACEHOLDER,
                    value: value,
                    onChange: (event, { newValue }) => {
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
