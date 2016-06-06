import React from 'react';
import Select from 'react-select';

// wrapper for react-select in order to use it with redux-form
// export default doesn't work :(
module.exports = ({ options, binding, multi }) => {
    const { onBlur, value, ...bindingProps } = binding;

    return (
        <Select options={options}
                onBlur={() => onBlur}
                value={value || ''}
                { ...bindingProps }
                multi={multi || false} />
    );
};
