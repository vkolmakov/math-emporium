import React, { useState } from "react";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try typing in MATH125 or Chemistry";

function checkForSplitCourseCodeInput(value) {
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

    if (isSplitCourseCodeInput) {
        return {
            courseNamePortion: splitCourseCodeMatchGroup[1],
            // whatever digits the query ends with
            courseNumberPortion: splitCourseCodeMatchGroup[3],
        };
    }
    return void 0;
}

const getSuggestions = (value, courses) => {
    const inputValue = value.toLowerCase();
    const inputLength = value.length;
    const splitCourseCodeCheck = checkForSplitCourseCodeInput(value);

    function isMatchingInput(course) {
        if (splitCourseCodeCheck) {
            // whatever letters come before the number
            return (
                course.code
                    .toLowerCase()
                    .includes(splitCourseCodeCheck.courseNamePortion) &&
                course.code
                    .toLowerCase()
                    .includes(splitCourseCodeCheck.courseNumberPortion)
            );
        }

        return (
            course.code.toLowerCase().includes(inputValue) ||
            course.name.toLowerCase().includes(inputValue)
        );
    }

    return inputLength === 0 ? [] : courses.filter(isMatchingInput);
};

function courseToString(course) {
    return `${course.code}: ${course.name}`;
}

function WithHighlightedFragments({ text, fragmentsToHighlight }) {
    // first unhighlighted fragment
    const result = [];
    let currentUnhighlightedIndex = 0;
    for (let { start, end } of fragmentsToHighlight) {
        const unhighlightedFragment = (
            <span key={`${text}-${currentUnhighlightedIndex}-${start}`}>
                {text.substring(currentUnhighlightedIndex, start)}
            </span>
        );
        const highlightedFragment = (
            <span
                key={`${text}-${start}-${end}`}
                className="course-selection-autocomplete__suggestion-option-query-text">
                {text.substring(start, end)}
            </span>
        );
        currentUnhighlightedIndex = end;

        result.push(unhighlightedFragment, highlightedFragment);
    }
    const lastUnhighlightedFragment = (
        <span key={`${text}-${currentUnhighlightedIndex}-${text.length}`}>
            {text.substring(currentUnhighlightedIndex, text.length)}
        </span>
    );
    result.push(lastUnhighlightedFragment);
    return result;
}

function Suggestion(course, { query }) {
    const courseString = courseToString(course);
    const splitCourseCodeCheck = checkForSplitCourseCodeInput(query);
    let fragmentsToHighlight = [];

    if (splitCourseCodeCheck) {
        const courseStringLower = courseString.toLowerCase();
        const courseNameStart = courseStringLower.indexOf(
            splitCourseCodeCheck.courseNamePortion
        );
        const courseNameEnd =
            courseNameStart + splitCourseCodeCheck.courseNamePortion.length;
        const courseNumberStart = courseStringLower.indexOf(
            splitCourseCodeCheck.courseNumberPortion
        );
        const courseNumberEnd =
            courseNumberStart + splitCourseCodeCheck.courseNumberPortion.length;
        fragmentsToHighlight = [
            { start: courseNameStart, end: courseNameEnd },
            { start: courseNumberStart, end: courseNumberEnd },
        ];
    } else {
        // default to trying to find the first occurrence of the text.
        const queryMatchStart = courseString
            .toLowerCase()
            .indexOf(query.toLowerCase());

        if (queryMatchStart > -1) {
            fragmentsToHighlight = [
                { start: queryMatchStart, end: queryMatchStart + query.length },
            ];
        }
    }

    return (
        <div className="course-selection-autocomplete__suggestion-option">
            <WithHighlightedFragments
                text={courseString}
                fragmentsToHighlight={fragmentsToHighlight}
            />
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
