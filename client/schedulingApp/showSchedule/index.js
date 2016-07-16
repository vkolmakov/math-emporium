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
         setStartDate } from '../actions';

import { selectTransformOptions } from '../../editingApp/utils';

class ShowSchedule extends Component {
    render() {
        const { locations, courses, startDate } = this.props;
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
            selected: state.scheduling.shared.locations.selected,
            all: state.scheduling.shared.locations.all,
        },
        courses: {
            selected: state.scheduling.shared.courses.selected,
            all: state.scheduling.shared.courses.all,
        },
        startDate: state.scheduling.showSchedule.startDate,
        openSpots: state.scheduling.showSchedule.openSpots,
    };
}

export default connect(mapStateToProps, {
    getLocations,
    getCourses,
    setLocation,
    setCourse,
    setStartDate,
})(ShowSchedule);
