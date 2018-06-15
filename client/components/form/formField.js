import React from "react";
import FormInput from "./formInput";

export default ({ field }) => {
    const { label, input } = field;

    return (
        <div className="form-field">
            <label>{label}</label>
            <FormInput {...input} />
        </div>
    );
};
