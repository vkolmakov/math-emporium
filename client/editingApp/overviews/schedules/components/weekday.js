import React from 'react';
import Table from '../../../components/table/index';
import { TIME_OPTIONS, WEEKDAY_OPTIONS } from '../../../constants';

export default ({ weekday, schedule }) => {
    const tableHeaders = [
        {
            dataKey: 'time',
            mapValuesToLabels: TIME_OPTIONS,
            label: 'Time',
        }, {
            dataKey: 'tutors->name',
            label: 'Tutors',
        },
    ];

    const sortedSchedule = schedule.sort(
        (s1, s2) => s1.time - s2.time
    );

    const weekdayHeader = WEEKDAY_OPTIONS.find(
        ({ value, display }) => value == weekday
    ).display;

    return (
        <div className="list-wrap">
          <h2>{weekdayHeader}</h2>
          <Table headers={tableHeaders}
                 data={schedule}
                 actions={[]} />
        </div>
    );
};
