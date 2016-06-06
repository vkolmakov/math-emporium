import React from 'react';

export default ({ header, datum }) => {
    const { dataKey, label } = header;
    const [key, subkey] = dataKey.split('->');

    let displayDataValue = '';

    if (subkey && datum[key]) {
        // given header contains an object
        if (Array.isArray(datum[key])) {
            // given datum is an array
            displayDataValue = datum[key].map((elem) => elem[subkey]).join(', ');
        } else {
            // just an object
            displayDataValue = datum[key][subkey];
        }
    } else {
        // just a value
        displayDataValue = datum[key];
    }

    return (
        <td data-header={label}
            key={dataKey}>{displayDataValue}</td>
    );
};
