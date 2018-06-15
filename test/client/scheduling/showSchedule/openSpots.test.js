import React from "react";
import moment from "moment";
import renderer from "react-test-renderer";
import OpenSpots from "../../../../client/schedulingApp/showSchedule/components/openSpots";
import { Either } from "../../../../client/utils";
import { OPEN_SPOTS_LOADING_MESSAGE } from "../../../../client/schedulingApp/showSchedule/constants";

describe("OpenSpots component", () => {
    const startDate = moment("2017-01-02 00:00:00");
    const now = moment("2017-01-03 06:00:00");
    const handlers = {
        available: (time) => (e) => "available",
        expired: (time) => (e) => "expired",
        closed: (time) => (e) => "closed",
    };

    it("renders an appropriate error message if location is missing", () => {
        let component = renderer.create(
            <OpenSpots
                isLocationSelected={false}
                isCourseSelected={false}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Left()}
            />,
        );

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();

        component = renderer.create(
            <OpenSpots
                isLocationSelected={false}
                isCourseSelected={true}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Left()}
            />,
        );

        tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders an appropriate error message if course is not selected but location is", () => {
        const component = renderer.create(
            <OpenSpots
                isLocationSelected={true}
                isCourseSelected={false}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Left()}
            />,
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it("renders a spinner if both location and course are selected, but openSpots is a Left of loading message", () => {
        const component = renderer.create(
            <OpenSpots
                isLocationSelected={true}
                isCourseSelected={true}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Left(OPEN_SPOTS_LOADING_MESSAGE)}
            />,
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it("renders an error message if both location and course are selected, but openSpots is a Left of any other message", () => {
        const component = renderer.create(
            <OpenSpots
                isLocationSelected={true}
                isCourseSelected={true}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Left("No ducks here.")}
            />,
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it("correctly partitions and renders open spots", () => {
        const openSpots = [
            { count: 2, time: 540, weekday: 3 },
            { count: 2, time: 600, weekday: 2 },
            { count: 1, time: 600, weekday: 4 },
            { count: 5, time: 660, weekday: 4 },
        ];

        const component = renderer.create(
            <OpenSpots
                isLocationSelected={true}
                isCourseSelected={true}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Right(openSpots)}
            />,
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it("applies correct classes to empty and expired spots", () => {
        const openSpots = [
            { count: 2, time: 540, weekday: 1 },
            { count: 0, time: 600, weekday: 1 },
            { count: 0, time: 600, weekday: 2 },
        ];

        const component = renderer.create(
            <OpenSpots
                isLocationSelected={true}
                isCourseSelected={true}
                startDate={startDate}
                now={now}
                handlers={handlers}
                openSpots={Either.Right(openSpots)}
            />,
        );

        expect(component.toJSON()).toMatchSnapshot();
    });
});
