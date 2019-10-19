import React, { useState } from "react";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try typing in MATH125 or Chemistry";

const getSuggestions = (value, coursesSearcher) => {
    const inputLength = value.length;
    return inputLength === 0 ? [] : coursesSearcher.queryWithMatches(value);
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

function Suggestion(courseWithMatches, { query }) {
    const course = courseWithMatches.item;
    const courseString = courseToString(course);
    let fragmentsToHighlight = [];
    const tokens = query.split(/\s+/);
    for (let token of tokens) {
        const queryTokenIndex = courseString
            .toLowerCase()
            .indexOf(token.toLowerCase());
        if (queryTokenIndex > -1) {
            fragmentsToHighlight.push({
                start: queryTokenIndex,
                end: queryTokenIndex + token.length,
            });
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
                    setSuggestions(getSuggestions(value, props.coursesSearcher))
                }
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={(value) => courseToString(value.item)}
                renderSuggestion={Suggestion}
                inputProps={{
                    placeholder: SEARCH_PLACEHOLDER,
                    value: value,
                    onChange: (_event, { newValue }) => {
                        setValue(newValue);
                    },
                }}
                onSuggestionSelected={(_event, data) => {
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
            subject: propTypes.shape({ id: propTypes.number }),
        })
    ),
    coursesSearcher: propTypes.shape({
        queryWithMatches: propTypes.func,
    }),
    onCourseSelection: propTypes.func,
};

function mapStateToProps() {
    return {};
}

export default connect(mapStateToProps)(CourseSelectionAutocomplete);
