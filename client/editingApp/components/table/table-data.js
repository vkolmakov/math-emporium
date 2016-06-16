import React from 'react';

import ColorIcon from '../colorIcon';

export default ({ header, datum }) => {
    const { dataKey, label } = header;
    const [key, subkey] = dataKey.split('->');
    let displayDataElement;

    if (key === 'hexColor') {
        // if it has a color, just display a colorIcon
        displayDataElement = <ColorIcon color={datum[key]}/>;
    } else if (subkey && datum[key]) {
        // given header contains an object
        if (Array.isArray(datum[key])) {
            // given datum is an array
            displayDataElement = <span>{datum[key].map((elem) => elem[subkey]).join(', ')}</span>;
        } else {
            // just an object
            displayDataElement = <span>{datum[key][subkey]}</span>;
        }
    } else {
        // just a value
        displayDataElement = <span>{datum[key]}</span>;
    }

    return (
        <td data-header={label}
            key={dataKey}>{displayDataElement}</td>
    );
};
