import React from 'react';

const handleChange = (options, event) => (onChange) =>
      onChange(options.find(o => o.value == event.target.value));

export default ({ options, currentValue, onChange, placeholder, error }) => {
    const createClassName = (error, currentValue) => {
        const classNames = {
            error: 'select-filter-error',
            empty: 'select-filter-empty',
            default: 'select-filter-wrap',
        };

        let result = [classNames.default];

        if (error) {
            result = result.concat([classNames.error]);
        }

        if (!currentValue) {
            result = result.concat([classNames.empty]);
        }

        return result.join(' ');
    };
        // <div className={createClassName(error, currentValue)}>
    return (
        <select value={currentValue || 0}
                className={createClassName(error, currentValue)}
                onChange={(event) => handleChange(options, event)(onChange)}>
            <option value={0} disabled>{placeholder}</option>
            {options.map(({ value, label }) => (<option value={value} key={value}>{label}</option>))}
        </select>);
};
