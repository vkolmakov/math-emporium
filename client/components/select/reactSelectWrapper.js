import React from "react";
import Select from "react-select";

// wrapper for react-select in order to use it with redux-form
export default ({ options, binding, multi, ...rest }) => {
    if (!binding) {
        return <Select options={options} multi={multi || false} {...rest} />;
    }

    const { onBlur, value, ...bindingProps } = binding;

    // arrow function is required to make onBlur work
    const onBlurHandler = () => onBlur;

    return (
        <Select
            options={options}
            onBlur={onBlurHandler}
            value={value || ""}
            {...bindingProps}
            multi={multi || false}
            {...rest}
        />
    );
};
