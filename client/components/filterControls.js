import React from 'react';

const handleChange = (options, event) => (onChange) =>
      onChange(options.find(o => o.value == event.target.value));

export default ({ options, currentValue, onChange, placeholder, error, selectRef, label, disableNullOption, disabled, testId }) => {
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

    const selectElementId = `select-${label.toLowerCase().split(/\s+/).join('-')}`;

    return (
        <div className="input-group">
            <label htmlFor={selectElementId}>{label}</label>
            <select
                value={currentValue || 0}
                id={selectElementId}
                disabled={!!disabled}
                ref={(select) => selectRef ? selectRef(select) : null}
                className={createClassName(error, currentValue)}
                onChange={(event) => handleChange(options, event)(onChange)}
                data-test={testId}>
              <option disabled={disableNullOption} value={0}>{placeholder}</option>
              {options.map(({ value, label }) => (<option value={value} key={value}>{label}</option>))}
            </select>
        </div>);
};
