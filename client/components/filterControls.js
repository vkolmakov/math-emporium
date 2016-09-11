import React from 'react';
import Select from 'react-select';

export default ({ options, currentValue, onChange, placeholder }) => (
    <div className="select-filter-wrap">
      <Select options={(options)}
              value={currentValue}
              searchable={false}
              placeholder={placeholder}
              onChange={onChange} />
    </div>
);
