import React from "react";

import ColorIcon from "../colorIcon";

export default ({ header, datum }) => {
    const { dataKey, label, mapValuesToLabels } = header;
    const [key, subkey] = dataKey.split("->");

    let DisplayDataElement;

    if (key === "hexColor") {
        // if it has a color, just display a colorIcon
        DisplayDataElement = () => <ColorIcon color={datum[key]} />;
    } else if (subkey && datum[key]) {
        // given header contains an object
        if (Array.isArray(datum[key])) {
            // given datum is an array
            DisplayDataElement = () => (
                <span>
                    {datum[key]
                        .map((elem) => elem[subkey])
                        .sort()
                        .join(", ")}
                </span>
            );
        } else {
            // just an object
            DisplayDataElement = () => <span>{datum[key][subkey]}</span>;
        }
    } else {
        // just a value
        let displayValue;
        if (mapValuesToLabels) {
            displayValue = mapValuesToLabels(datum[key]);
        } else if (typeof datum[key] === "boolean") {
            displayValue = datum[key] ? "true" : "false";
        } else {
            displayValue = datum[key] ? datum[key].toString() : "";
        }
        DisplayDataElement = () => <span>{displayValue}</span>;
    }

    return (
        <td data-header={label} key={dataKey}>
            <DisplayDataElement />
        </td>
    );
};
