import React from 'react';
import Select from 'react-select';

import { selectTransformOptions } from '../utils';

export default ({ options, currentValue, onChange }) => (
    <div className="select-filter-wrap">
      <Select options={selectTransformOptions()(options)}
              value={currentValue}
              onChange={onChange} />
    </div>
);
