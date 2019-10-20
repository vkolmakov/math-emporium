import React, { useState, useRef, useEffect } from "react";
import Modal from "react-modal";
import { connect } from "react-redux";
import Autosuggest from "react-autosuggest";
import propTypes from "prop-types";

const SEARCH_PLACEHOLDER = "Try searching for MATH125 or Chemistry";

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

function Suggestion(getLocationNameFromCourse) {
    return (courseWithMatches, { query }) => {
        const course = courseWithMatches.item;
        const courseString = courseToString(course);
        let fragmentsToHighlight = [];
        const tokens = query.split(/\s+/);
        for (let token of tokens) {
            const queryTokenIndex = courseString
                .toLowerCase()
                .indexOf(token.toLowerCase());
            if (token && queryTokenIndex > -1) {
                fragmentsToHighlight.push({
                    start: queryTokenIndex,
                    end: queryTokenIndex + token.length,
                });
            }
        }

        return (
            <div className="course-selection-autocomplete__suggestion-option">
                <div className="course-selection-autocomplete__suggestion-option-value">
                    <WithHighlightedFragments
                        text={courseString}
                        fragmentsToHighlight={fragmentsToHighlight}
                    />
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
        if (props.shouldFocusOnInputWhenRendered) {
            if (typeof autosuggestInputRef.current.input.focus === "function") {
                autosuggestInputRef.current.input.focus();
            }

            if (typeof props.onAfterInitialFocus === "function") {
                props.onAfterInitialFocus();
            }
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
    ),
    getLocationNameFromCourse: propTypes.func,
    coursesSearcher: propTypes.shape({
        queryWithMatches: propTypes.func,
    }),
    onCourseSelection: propTypes.func,
    onFocus: propTypes.func,
    onBlur: propTypes.func,
    onAfterInitialFocus: propTypes.func,
    shouldFocusOnInputWhenRendered: propTypes.bool,
    theme: propTypes.string,
};

function mapStateToProps() {
    return {};
}

export default connect(mapStateToProps)(CourseSelectionAutocomplete);
