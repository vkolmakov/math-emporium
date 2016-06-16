import React from 'react';
import Select from '../select/reactSelectWrapper';

import ColorIcon from '../colorIcon';

export default ({ type, binding, options }) => {
    let inputElement;

    if (type === 'text') {
        inputElement = (
              <input type="text" {...binding}/>
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

        inputElement = (
            <Select options={options}
                    binding={binding}
                    multi={type === 'multiselect'}
                    {...renderer} />
        );
    }

    return (
        <div className="form-input-group">
          {inputElement}
          <span className="form-help">{binding.touched ? binding.error : '' }</span>
        </div>
    );
};
