import React from "react";
import FormField from "./formField";
import Alert from "./formAlert";
import Success from "./formSuccess";

export default function Form({
    handleSubmit,
    description,
    hideSubmitButton,
    title,
    fields,
    error,
    success,
}) {
    const MaybeSubmitButton = () =>
        !!hideSubmitButton ? (
            <span />
        ) : (
            <button className="button" type="submit">
                Submit
            </button>
        );

    const MaybeDescription = () =>
        !!description ? <p>{description}</p> : <span />;

    return (
        <form onSubmit={handleSubmit}>
            <h2>{title}</h2>
            <MaybeDescription />
            {fields.map((field) => (
                <FormField field={field} key={field.label} />
            ))}

            <div className="form-field submit-field">
                <MaybeSubmitButton />
                <Alert error={error} />
                <Success success={success} />
            </div>
        </form>
    );
}
