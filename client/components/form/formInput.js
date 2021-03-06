import React from "react";
import Select from "../select/reactSelectWrapper";

import ColorIcon from "../colorIcon";

export default ({
    type,
    testId,
    binding,
    options,
    onSelect,
    controlValue,
    placeholder,
    ...rest
}) => {
    let inputElement;

    const textInputTypes = ["text", "password", "email", "textarea", "number"];
    const isTextInput = !!textInputTypes.find((t) => t === type);

    const selectInputTypes = ["select", "multiselect"];
    const isSelectInput = options && !!selectInputTypes.find((t) => t === type);

    if (isTextInput) {
        const value = controlValue || "";

        if (type === "textarea") {
            inputElement = (
                <textarea
                    style={{ resize: "vertical" }}
                    rows={3}
                    value={value}
                    data-test={testId}
                    {...binding}
                />
            );
        } else {
            inputElement = (
                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    data-test={testId}
                    {...binding}
                />
            );
        }
    } else if (isSelectInput) {
        let renderer = {};

        if (options[0] && options[0].color) {
            renderer = {
                optionRenderer: (option) => (
                    <div>
                        <ColorIcon color={option.color} />
                        {option.label}
                    </div>
                ),
                valueRenderer: (option) => (
                    <div>
                        <ColorIcon color={option.color} />
                        {option.label}
                    </div>
                ),
            };
        }
        let onSelectHandler;
        if (onSelect) {
            onSelectHandler = (value) => {
                // custom handler
                onSelect(value);
                // default event handler from redux-form
                binding.onChange(value);
            };
        } else {
            onSelectHandler = (value) => {
                // if no custom on select event provided, just do the default
                binding.onChange(value);
            };
        }

        if (controlValue) {
            // tie up to the value from the store
            binding = {
                ...binding,
                value: controlValue,
            };
        }

        inputElement = (
            <Select
                options={options}
                binding={binding}
                multi={type === "multiselect"}
                onChange={onSelectHandler}
                {...renderer}
                {...rest}
            />
        ); // Ugly workaround to make redux-form and custom event handler work together
    } else if (type === "checkbox") {
        inputElement = <input type="checkbox" value={false} {...binding} />;
    }

    return (
        <div className="form-input-group">
            {inputElement}
            <span className="form-help">
                {binding.touched ? binding.error : ""}
            </span>
        </div>
    );
};
