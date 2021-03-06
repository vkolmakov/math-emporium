import React from "react";

import TableData from "./table-data";
import TableAction from "./table-action";

export default ({ datum, headers, actions }) => (
    <tr>
        {headers.map((header) => (
            <TableData key={header.label} datum={datum} header={header} />
        ))}
        {actions.map((action) => (
            <TableAction key={action.label} action={action} datum={datum} />
        ))}
    </tr>
);
