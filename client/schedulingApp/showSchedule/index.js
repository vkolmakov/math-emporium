import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import DatePicker from 'react-datepicker';

import FilterControls from '../../components/filterControls';
import OpenSpots from './components/openSpots';

import TutorSelectionModal from './components/tutorSelectionModal';
import LoadingModal from './components/loadingModal';
import ProfileModal from './components/profileModal';

import { MODAL_LIFECYCLE } from './constants';

import { setLocation,
         setCourse } from '../actions';

import { setStartDate,
         getOpenSpots,
         selectOpenSpot,
         clearOpenSpotSelection,
         getAvailableTutors,
         displayTutorSelectionModal } from './actions';

import { selectTransformOptions } from '../../editingApp/utils';

class ShowSchedule extends Component {
    onSelectChange(prevVal, handler, key = 'id') {
        return (nextVal) => {
            let isValChange;
            if (key) {
                isValChange = !(prevVal && nextVal) || prevVal[key] !== nextVal[key];
            } else {
                isValChange = !(prevVal && nextVal) || (prevVal !== nextVal);
            }

            if (isValChange) {
                handler(nextVal);
            }
        };
    }

    onCourseChange(courseOption) {
        const { courses } = this.props;

        const prevCourse = courses.selected;
        const nextCourse = courseOption ? courses.all.find(c => courseOption.value === c.id) : null;

        return this.onSelectChange(prevCourse, this.props.setCourse)(nextCourse);
    }

    onLocationChange(locationOption) {
        const { locations } = this.props;

        const prevLocation = locations.selected;
        const nextLocation = locationOption ? locations.all.find(l => locationOption.value === l.id) : null;

        return this.onSelectChange(prevLocation, this.props.setLocation)(nextLocation);
    }

    onStartDateChange(startDateOption) {
        const { startDate } = this.props;

        const prevStartDate = startDate;
        const nextStartDate = moment(startDateOption.startOf('isoWeek'));

        if (prevStartDate && !prevStartDate.isSame(nextStartDate)) {
            this.props.setStartDate(nextStartDate);
        }
    }

    componentDidUpdate(prevProps) {
        const location = this.props.locations.selected;
        const [prevCourse, course] = [prevProps.courses.selected, this.props.courses.selected];
        const [prevStartDate, startDate] = [prevProps.startDate, this.props.startDate];

        const isEverythingSelected = [location, course, startDate].every(e => !!e);
        const isRerenderWithNewCourse = prevCourse && course && prevCourse.id !== course.id || !prevCourse;
        const isRerenderWithNewDate = prevStartDate && startDate && prevStartDate !== startDate;

        if (isEverythingSelected && (isRerenderWithNewCourse || isRerenderWithNewDate)) {
            this.props.getOpenSpots({ location, course, startDate });
        }
    }

    selectModal(currentModalStatus) {

        return () => {
            switch (currentModalStatus) {
            case MODAL_LIFECYCLE.SELECTING_TUTOR:
                return (<TutorSelectionModal />);

            case MODAL_LIFECYCLE.LOADING:
                return (<LoadingModal onRequestClose={clearOpenSpotSelection} />);

            case MODAL_LIFECYCLE.MISSING_PROFILE:
                return (<ProfileModal onRequestClose={clearOpenSpotSelection} />);

            default:
                return (<span />);
            }
        };
    }

    render() {
        const { locations, courses, startDate, openSpots, modalInfo } = this.props;
        const now = moment();
        const locationsOptions = selectTransformOptions()(locations.all);

        let coursesOptions;
        if (!locations.selected) {
            coursesOptions = [];
        } else {
            const transformCourseToOption = c => ({ value: c.id, label: `${c.code}: ${c.name}` });
            coursesOptions = courses.all
                .filter(c => c.location.id === locations.selected.id)
                .map(transformCourseToOption);
        }

        const openSpotHandlers = {
            available: time => e => {
                const [course, location] = [courses.selected, locations.selected];
                this.props.selectOpenSpot({ time, course, location });
                this.props.getAvailableTutors({ time, course, location })
                    .then(res => res.data)
                    .then(tutors => this.props.displayTutorSelectionModal({ tutors }));
            },
            expired: time => e => this.props.clearOpenSpotSelection(),
            closed: time => e => this.props.clearOpenSpotSelection(),
        };

        const MaybeModal = modalInfo.displayModal
            ? this.selectModal(modalInfo.status).bind(this)
            : () => (<span />);

        return (
            <div className="content">

              <div className="show-schedule-controls">

                <div className="dual-datepicker-wrap">
                  <DatePicker selected={startDate}
                              startDate={startDate}
                              endDate={moment(startDate).endOf('isoWeek')}
                              locale="en-gb"
                              dateFormat="MM/DD/YYYY"
                              readOnly={true}
                              onChange={this.onStartDateChange.bind(this)} />

                  <DatePicker selected={moment(startDate).endOf('isoWeek')}
                              locale="en-gb"
                              dateFormat="MM/DD/YYYY"
                              disabled={true} />
                </div>

                <FilterControls options={locationsOptions}
                                currentValue={locations.selected ? locations.selected.id : null}
                                placeholder="Select a location"
                                onChange={this.onLocationChange.bind(this)} />

                <FilterControls options={coursesOptions}
                                currentValue={courses.selected ? courses.selected.id : null}
                                placeholder="Select a course"
                                onChange={this.onCourseChange.bind(this)} />

              </div>

              <OpenSpots isCourseSelected={!!courses.selected}
                         isLocationSelected={!!locations.selected}
                         startDate={startDate}
                         now={now}
                         openSpots={openSpots}
                         handlers={openSpotHandlers} />

              <MaybeModal />
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
        modalInfo: state.scheduling.showSchedule.modalInfo,
    };
}

export default connect(mapStateToProps, {
    setLocation,
    setCourse,
    setStartDate,
    getOpenSpots,
    selectOpenSpot,
    clearOpenSpotSelection,
    getAvailableTutors,
    displayTutorSelectionModal,
})(ShowSchedule);
