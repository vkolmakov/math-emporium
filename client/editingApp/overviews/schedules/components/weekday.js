import React from "react";
import Table from "../../../../components/table/index";
import { TIME_OPTIONS, WEEKDAY_OPTIONS } from "../../../../constants";

export default ({ weekday, schedule }) => {
    const tableHeaders = [
        {
            dataKey: "time",
            mapValuesToLabels: (val) =>
                TIME_OPTIONS.find(({ value }) => value === val).display,
            label: "Time",
        },
        {
            dataKey: "tutors->name",
            label: "Tutors",
        },
    ];

    const weekdayHeader = WEEKDAY_OPTIONS.find(({ value }) => value === weekday)
        .display;

    return (
        <div className="list-wrap">
            <h2>{weekdayHeader}</h2>
            <Table headers={tableHeaders} data={schedule} actions={[]} />
        </div>
    );
};
