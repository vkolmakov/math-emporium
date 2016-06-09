import React from 'react';
import Select from '../select/reactSelectWrapper';

export default ({ type, binding, options }) => {
    let inputElement;

    if (type === 'text') {
        inputElement = (
            <input type="text" {...binding}/>
        );
    } else if (type === 'select' || type === 'multiselect' && options) {
        inputElement = (
            <Select options={options}
                    binding={binding}
                    multi={type === 'multiselect'}/>
        );
    }

    return (
        <div className="form-input-group">
          {inputElement}
          <span className="form-help">{binding.touched ? binding.error : '' }</span>
        </div>
    );
};
