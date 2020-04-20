import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try searching for MATH125 or Statistics";

const SUGGESTION_SELECTED_CLASS_NAME =
    "react-autosuggest__input--course-selection-autocomplete-with-suggestion-selected";

const getSuggestions = (value, allCourses, coursesSearcher) => {
    const inputLength = value.length;
    return inputLength === 0
        ? allCourses.map((c) => ({ item: c }))
        : coursesSearcher.queryWithMatches(value);
};

function courseToString(course) {
    return `${course.code}: ${course.name}`;
}

function Suggestion(getLocationNameFromCourse) {
    return (courseWithMatches, { query }) => {
        const course = courseWithMatches.item;
        const courseString = courseToString(course);
        return (
            <div className="course-selection-autocomplete__suggestion-option">
                <div className="course-selection-autocomplete__suggestion-option-value">
                    {courseString}
                </div>
                <div className="course-selection-autocomplete__suggestion-option-location">
                    <span>{getLocationNameFromCourse(course)}</span>
                </div>
            </div>
        );
    };
}

function CourseSelectionAutocomplete(props) {
    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState("");
    const autosuggestInputRef = useRef(null);

    useEffect(() => {
        if (typeof props.onRenderComplete === "function") {
            props.onRenderComplete({
                textInputRef: autosuggestInputRef.current.input,
            });
        }
    }, []);

    return (
        <div
            className={`course-selection-autocomplete course-selection-autocomplete--${
                props.theme
            }`}>
            <Autosuggest
                ref={autosuggestInputRef}
                suggestions={suggestions}
                shouldRenderSuggestions={() => true}
                onSuggestionsFetchRequested={({ value }) =>
                    setSuggestions(
                        getSuggestions(
                            value,
                            props.courses,
                            props.coursesSearcher
                        )
                    )
                }
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={(value) => courseToString(value.item)}
                renderSuggestion={Suggestion(props.getLocationNameFromCourse)}
                inputProps={{
                    placeholder: SEARCH_PLACEHOLDER,
                    value: value,
                    type: "search",
                    onChange: (_event, { newValue }) => {
                        setValue(newValue);
                    },
                    onFocus: () => {
                        if (typeof props.onFocus === "function") {
                            props.onFocus();
                        }
                    },
                    onBlur: () => {
                        if (typeof props.onBlur === "function") {
                            props.onBlur();
                        }
                    },
                }}
                onSuggestionHighlighted={({ suggestion }) => {
                    if (suggestion) {
                        autosuggestInputRef.current.input.classList.add(
                            SUGGESTION_SELECTED_CLASS_NAME
                        );
                    } else {
                        autosuggestInputRef.current.input.classList.remove(
                            SUGGESTION_SELECTED_CLASS_NAME
                        );
                    }
                }}
                onSuggestionSelected={(_event, data) => {
                    autosuggestInputRef.current.input.classList.add(
                        SUGGESTION_SELECTED_CLASS_NAME
                    );
                    const selectedCourse = data.suggestion.item;
                    props.onCourseSelection(selectedCourse);
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
            location: propTypes.shape({ id: propTypes.number }),
            subject: propTypes.shape({ id: propTypes.number }),
        })
    ).isRequired,
    getLocationNameFromCourse: propTypes.func.isRequired,
    coursesSearcher: propTypes.shape({
        queryWithMatches: propTypes.func,
    }).isRequired,
    onCourseSelection: propTypes.func,
    onFocus: propTypes.func,
    onBlur: propTypes.func,
    onRenderComplete: propTypes.func,
    theme: propTypes.string.isRequired,
};

function mapStateToProps() {
    return {};
}

export default connect(mapStateToProps)(CourseSelectionAutocomplete);
