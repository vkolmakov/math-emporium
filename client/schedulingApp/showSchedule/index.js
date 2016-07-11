import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import DatePicker from 'react-datepicker';

import FilterControls from '../../components/filterControls';
import OpenSpots from './components/openSpots';

import { getLocations,
         getCourses,
         setLocation,
         setCourse,
         setStartDate } from './actions';

import { selectTransformOptions } from '../../editingApp/utils';

class ShowSchedule extends Component {
    componentWillMount() {
        this.props.getLocations();
        this.props.getCourses();
    }

    render() {
        const { locations, courses, openSpots, startDate } = this.props;
        const locationsOptions = selectTransformOptions()(locations.all);

        let coursesOptions;
        if (!locations.selected) {
            coursesOptions = [];
        } else {
            const filteredCourses = courses.all.filter(c => c.location.id === locations.selected.id);
            coursesOptions = filteredCourses.map(c => ({
                value: c.id,
                label: `${c.code}: ${c.name}`,
            }));
        }

        return (
            <div className="content">

              <div className="show-schedule-controls">

                <div className="dual-datepicker-wrap">
                  <DatePicker selected={startDate}
                              startDate={startDate}
                              endDate={moment(startDate).endOf('isoWeek')}
                              locale="en-gb"
                              dateFormat="MM/DD/YYYY"
                              onChange={this.props.setStartDate} />

                  <DatePicker selected={moment(startDate).endOf('isoWeek')}
                              locale="en-gb"
                              dateFormat="MM/DD/YYYY"
                              disabled={true} />
                </div>

                <FilterControls options={locationsOptions}
                                currentValue={locations.selected ? locations.selected.id : null}
                                placeholder="Select a location"
                                onChange={this.props.setLocation} />

                <FilterControls options={coursesOptions}
                                currentValue={courses.selected ? courses.selected.id : null}
                                placeholder="Select a course"
                                onChange={this.props.setCourse} />

              </div>

              <OpenSpots course={courses.selected}
                         location={locations.selected}
                         startDate={startDate} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            selected: state.showSchedule.locations.selected,
            all: state.showSchedule.locations.all,
        },
        courses: {
            selected: state.showSchedule.courses.selected,
            all: state.showSchedule.courses.all,
        },
        startDate: state.showSchedule.startDate,
        openSpots: state.showSchedule.openSpots,
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getCourses,
    setLocation,
    setCourse,
    setStartDate,
})(ShowSchedule);
