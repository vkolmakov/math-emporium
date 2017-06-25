import React from 'react';

import { selectTransformOptions } from '../../editingApp/utils';

import FilterControls from '../../components/filterControls';
import Table from '../../components/table/index';

const EVENT_TYPES = {
    'create appointment': 1,
    'remove appointment': 2,
    'sign in': 3,
};

const EVENT_TYPES_OPTIONS =
      Object.keys(EVENT_TYPES).map(
          display => ({ value: EVENT_TYPES[display], display }));

const eventTypeOptions = selectTransformOptions('value', 'display')(EVENT_TYPES_OPTIONS);

const tableHeaders = [{
    dataKey: 'time',
    label: 'time',
}, {
    dataKey: 'type',
    label: 'type',
    mapValuesToLabels: EVENT_TYPES_OPTIONS,
}, {
    dataKey: 'user',
    label: 'user',
}, {
    dataKey: 'data',
    label: 'data',
}];

export default (props) => (
    <div className="content">
        <div className="content-nav">
            <h2>Events</h2>
            <FilterControls options={eventTypeOptions}
                            placeholder={'Filter by event type...'} />
        </div>

        <div className="list-wrap">
            <Table headers={tableHeaders}
                   data={events}
                   actions={[]} />
        </div>
    </div>
);

const events = [];
