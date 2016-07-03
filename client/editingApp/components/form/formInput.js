import React from 'react';
import Select from '../select/reactSelectWrapper';

import ColorIcon from '../colorIcon';

export default ({ type, binding, options, onSelect, controlValue }) => {
    let inputElement;

    if (type === 'text' || type === 'password') {
        inputElement = (
            <input type={type} {...binding}/>
        );
    } else if (type === 'select' || type === 'multiselect' && options) {
        let renderer = {};

        if (options[0] && options[0].color) {
            renderer = {
                optionRenderer: option => (
                    <div>
                      <ColorIcon color={option.color} />
                      {option.label}
                    </div>
                ),
                valueRenderer: option => (
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
            <Select options={options}
                    binding={binding}
                    multi={type === 'multiselect'}
                    {...renderer}
                    onChange={onSelectHandler}/>
        ); // Ugly workaround to make redux-form and custom event handler work together
    }

    return (
        <div className="form-input-group">
          {inputElement}
          <span className="form-help">{binding.touched ? binding.error : '' }</span>
        </div>
    );
};
