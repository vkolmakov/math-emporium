import React from 'react';
import moment from 'moment';
import renderer from 'react-test-renderer';
import OpenSpots from '../../../../client/schedulingApp/showSchedule/components/openSpots';

describe('OpenSpots component', () => {
    const startDate = moment('2017-01-02 00:00:00');
    const now = moment('2017-01-03 06:00:00');
    it('renders an appropriate error message if location is missing', () => {
        let component = renderer.create(
            <OpenSpots isLocationSelected={false}
                       isCourseSelected={false}
                       startDate={startDate}
                       now={now}
                       openSpots={[]} />
        );

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();

        component = renderer.create(
            <OpenSpots isLocationSelected={false}
                       isCourseSelected={true}
                       startDate={startDate}
                       now={now}
                       openSpots={[]} />
        );

        tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('renders an appropriate error message if course is not selected but location is', () => {
        const component = renderer.create(
            <OpenSpots isLocationSelected={true}
                       isCourseSelected={false}
                       startDate={startDate}
                       now={now}
                       openSpots={[]} />
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it('renders a spinner if both location and course are selected, but openSpots are empty', () => {
        const component = renderer.create(
            <OpenSpots isLocationSelected={true}
                       isCourseSelected={true}
                       startDate={startDate}
                       now={now}
                       openSpots={[]} />
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it('correctly partitions and renders open spots', () => {
        const openSpots = [
            { count: 2, time: 540, weekday: 3 },
            { count: 2, time: 600, weekday: 2 },
            { count: 1, time: 600, weekday: 4 },
            { count: 5, time: 660, weekday: 4 },
        ];

        const component = renderer.create(
            <OpenSpots isLocationSelected={true}
                       isCourseSelected={true}
                       startDate={startDate}
                       now={now}
                       openSpots={openSpots} />
        );

        expect(component.toJSON()).toMatchSnapshot();
    });

    it('applies correct classes to empty and expired spots', () => {
        const openSpots = [
            { count: 2, time: 540, weekday: 1 },
            { count: 0, time: 600, weekday: 1 },
            { count: 0, time: 600, weekday: 2 },
        ];

        const component = renderer.create(
            <OpenSpots isLocationSelected={true}
                       isCourseSelected={true}
                       startDate={startDate}
                       now={now}
                       openSpots={openSpots} />
        );

        expect(component.toJSON()).toMatchSnapshot();
    });
});
