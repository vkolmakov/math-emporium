import React from 'react';
import Select from 'react-select';

export default ({ options, currentValue, onChange, placeholder, error }) => (
    <div className={`select-filter-wrap ${error ? 'select-filter-error' : ''}`}>
      <Select options={(options)}
              value={currentValue}
              searchable={false}
              placeholder={placeholder}
              onChange={onChange} />
    </div>
);
