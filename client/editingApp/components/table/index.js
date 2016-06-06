import React from 'react';

import TableRow from './table-row';

export default ({ headers, data, actions }) => (
    <div className="list-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => <th key={h.label}>{h.label}</th>)}
          </tr>
        </thead>
        <tbody>
        {data.map((datum) => (
            <TableRow
               key={datum.id}
               headers={headers}
               datum={datum}
               actions={actions} />
        ))}
        </tbody>
      </table>
    </div>
);
