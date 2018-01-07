import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import DatePicker from 'react-datepicker';

import FilterControls from '../../components/filterControls';
import OpenSpots from './components/openSpots';

import TutorSelectionModal from './components/tutorSelectionModal';
import LoadingModal from './components/loadingModal';
import ProfileModal from './components/profileModal';
import MessageModal from './components/messageModal';

import { MODAL_LIFECYCLE } from './constants';

import { setLocation,
         setSubject,
         setCourse } from '../actions';

import { setStartDate,
         getOpenSpots,
         selectOpenSpot,
         clearOpenSpotSelection,
         getAvailableTutors,
         displayTutorSelectionModal,
         displayProfileModal,
         displayMessageModal } from './actions';

import { selectTransformOptions } from '../../editingApp/utils';
import { redirectTo } from '../../utils';

class ShowSchedule extends Component {
    componentDidMount() {
        const { selectedOpenSpotInfo, courses, locations, subjects, startDate } = this.props;

        const hasPreSelectedOpenSpot = selectedOpenSpotInfo.time
              && selectedOpenSpotInfo.course
              && selectedOpenSpotInfo.location
              && selectedOpenSpotInfo.subject;

        if (hasPreSelectedOpenSpot) {
            const { time, course, location, subject } = selectedOpenSpotInfo;
            this.createAvailableOpenSpotHandler(time, course, location, subject)();
        } else if (courses.selected && locations.selected && subjects.selected) {
            this.props.getOpenSpots({
                location: locations.selected,
                course: courses.selected,
                startDate,
                subject: subjects.selected,
            });
        } else if (this.locationSelect && !locations.selected) {
            this.locationSelect.focus();
        } else if (this.subjectSelect && !subjects.selected) {
            this.subjectSelect.focus();
        } else if (this.coursesSelect && !courses.selected) {
            this.coursesSelect.focus();
        }
    }

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

        this.onSelectChange(prevCourse, this.props.setCourse)(nextCourse);
    }

    onSubjectChange(subjectOption) {
        const { subjects } = this.props;

        const prevSubject = subjects.selected;
        const nextSubject = subjectOption ? subjects.all.find(l => subjectOption.value === l.id) : null;

        this.onSelectChange(prevSubject, this.props.setSubject)(nextSubject);
        if (this.courseSelect && nextSubject) {
            this.courseSelect.focus();
        }
    }

    onLocationChange(locationOption) {
        const { locations } = this.props;

        const prevLocation = locations.selected;
        const nextLocation = locationOption ? locations.all.find(l => locationOption.value === l.id) : null;

        this.onSelectChange(prevLocation, this.props.setLocation)(nextLocation);
        if (this.subjectSelect && nextLocation) {
            this.subjectSelect.focus();
        }
    }

    onStartDateChange(startDateOption) {
        const { startDate } = this.props;

        const prevStartDate = startDate;
        const nextStartDate = moment(startDateOption.startOf('isoWeek'));

        if (prevStartDate && !prevStartDate.isSame(nextStartDate)) {
            this.props.setStartDate(nextStartDate);

            const location = {
                shouldFocus: !this.props.locations.selected,
                elementRef: this.locationSelect,
            };
            const subject = {
                shouldFocus: !this.props.subjects.selected,
                elementRef: this.subjectSelect,
            };
            const course = {
                shouldFocus: !this.props.courses.selected,
                elementRef: this.courseSelect,
            };

            // target order is significant here
            const nextFocusTarget = [location, subject, course].find((t) => t.shouldFocus);

            if (nextFocusTarget && nextFocusTarget.elementRef) {
                // focus on the next target must be performed on next tick
                // due to the datepicker grabbing focus
                setTimeout(() => nextFocusTarget.elementRef.focus(), 0);
            }
        }
    }

    componentDidUpdate(prevProps) {
        const location = this.props.locations.selected;
        const [prevCourse, course] = [prevProps.courses.selected, this.props.courses.selected];
        const [prevSubject, subject] = [prevProps.subjects.selected, this.props.subjects.selected];
        const [prevStartDate, startDate] = [prevProps.startDate, this.props.startDate];

        const isEverythingSelected = [location, course, startDate, subject].every(e => !!e);

        const isRerenderWithNewCourse = prevCourse && course && prevCourse.id !== course.id || !prevCourse;
        const isRerenderWithNewSubject = prevSubject && subject && prevSubject.id !== subject.id || !prevSubject;
        const isRerenderWithNewDate = prevStartDate && startDate && prevStartDate !== startDate;

        if (isEverythingSelected && (isRerenderWithNewCourse || isRerenderWithNewDate || isRerenderWithNewSubject)) {
            this.props.getOpenSpots({ location, course, startDate, subject });
        }
    }

    selectModal(currentModalStatus) {
        return () => {
            switch (currentModalStatus) {
            case MODAL_LIFECYCLE.SELECTING_TUTOR:
                return (<TutorSelectionModal />);

            case MODAL_LIFECYCLE.LOADING:
                return (<LoadingModal onRequestClose={this.props.clearOpenSpotSelection} />);

            case MODAL_LIFECYCLE.MISSING_PROFILE:
                return (<ProfileModal onRequestClose={this.props.clearOpenSpotSelection} />);

            case MODAL_LIFECYCLE.DISPLAYING_MESSAGE:
                const onRequestClose = () => {
                    this.props.clearOpenSpotSelection();
                    if (this.props.modalInfo.redirectToAfterClosing) {
                        const redirectPath = this.props.modalInfo.redirectToAfterClosing;
                        this.props.markAsSelectedOnSidebar(redirectPath);
                        redirectTo(redirectPath);
                    }
                };
                return (
                    <MessageModal onRequestClose={onRequestClose}
                                  message={this.props.modalMessage} />
                );

            default:
                return (<span />);
            }
        };
    }

    createCoursesOptions(courses, subjects) {
        let coursesOptions;
        if (!subjects.selected) {
            coursesOptions = [];
        } else {
            const transformCourseToOption = c => ({ value: c.id, label: `${c.code}: ${c.name}` });
            coursesOptions = courses.all
                .filter(c => c.subject.id === subjects.selected.id)
                .map(transformCourseToOption);
        }

        return coursesOptions;
    }

    createSubjectsOptions(subjects, locations) {
        let subjectsOptions = [];
        if (locations.selected) {
            const transformSubjectToOption = s => ({ value: s.id, label: s.name });
            subjectsOptions = subjects.all
                .filter(s => s.location.id === locations.selected.id)
                .map(transformSubjectToOption);
        }

        return subjectsOptions;
    }

    createLocationsOptions(locations) {
        return selectTransformOptions()(locations.all);
    }

    createAvailableOpenSpotHandler(time, course, location, subject) {
        const { authenticated, profile } = this.props;

        return e => {
            this.props.selectOpenSpot({ time, course, subject, location });

            if (!authenticated) {
                return this.context.router.push('/signin');
            }

            const isCompleteProfile = profile && profile.firstName && profile.lastName;

            if (!isCompleteProfile) {
                return this.props.displayProfileModal();
            }

            return this.props.getAvailableTutors({ time, course, location, subject })
                .then(res => res.data)
                .then(tutors => tutors.length > 0
                      ? this.props.displayTutorSelectionModal({ tutors })
                      : this.props.displayMessageModal({ message: 'There are no more tutors left for this time slot.' }));
        };
    }

    render() {
        const { locations, courses, subjects, startDate, openSpots, modalInfo } = this.props;
        const now = moment();

        const locationsOptions = this.createLocationsOptions(locations);
        const subjectsOptions = this.createSubjectsOptions(subjects, locations);
        const coursesOptions = this.createCoursesOptions(courses, subjects);

        const openSpotHandlers = {
            available: time => this.createAvailableOpenSpotHandler(time, courses.selected, locations.selected, subjects.selected),
            expired: time => e => this.props.clearOpenSpotSelection(),
            closed: time => e => this.props.clearOpenSpotSelection(),
        };

        const MaybeModal = modalInfo.displayModal
            ? this.selectModal(modalInfo.status).bind(this)
            : () => (<span />);

        return (
            <div className="content">

                <div className="show-schedule-controls">

                    <div className="column">
                        <div className="input-group">
                            <label htmlFor="dual-datepicker">Week</label>
                            <div className="dual-datepicker-wrap">
                                <DatePicker selected={startDate}
                                            startDate={startDate}
                                            endDate={moment(startDate).endOf('isoWeek')}
                                            locale="en-gb"
                                            dateFormat="MM/DD/YYYY"
                                            readOnly={true}
                                            onChange={this.onStartDateChange.bind(this)}
                                            id="dual-datepicker"/>

                                <DatePicker selected={moment(startDate).endOf('isoWeek')}
                                            locale="en-gb"
                                            dateFormat="MM/DD/YYYY"
                                            disabled={true} />
                            </div>
                        </div>

                        <FilterControls options={locationsOptions}
                                        currentValue={locations.selected ? locations.selected.id : null}
                                        placeholder="Select..."
                                        label="Location"
                                        error={!locations.selected}
                                        selectRef={input => { this.locationSelect = input; } }
                                        onChange={this.onLocationChange.bind(this)} />

                    </div>

                    <div className="column">
                        <FilterControls options={subjectsOptions}
                                        currentValue={subjects.selected ? subjects.selected.id : null}
                                        placeholder="Select..."
                                        label="Subject"
                                        error={locations.selected && !subjects.selected}
                                        selectRef={input => { this.subjectSelect = input; } }
                                        onChange={this.onSubjectChange.bind(this)} />

                            <FilterControls options={coursesOptions}
                                            currentValue={courses.selected ? courses.selected.id : null}
                                            placeholder="Select..."
                                            label="Course"
                                            error={locations.selected && subjects.selected && !courses.selected}
                                            selectRef={input => { this.courseSelect = input; } }
                                            onChange={this.onCourseChange.bind(this)} />
                    </div>

              </div>

              <OpenSpots isCourseSelected={!!courses.selected}
                         isSubjectSelected={!!subjects.selected}
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
        subjects: {
            selected: state.scheduling.shared.subjects.selected,
            all: state.scheduling.shared.subjects.all,
        },
        courses: {
            selected: state.scheduling.shared.courses.selected,
            all: state.scheduling.shared.courses.all,
        },
        startDate: state.scheduling.showSchedule.startDate,
        openSpots: state.scheduling.showSchedule.openSpots,
        modalInfo: state.scheduling.showSchedule.modalInfo,
        modalMessage: state.scheduling.showSchedule.message,
        profile: state.scheduling.profile,
        selectedOpenSpotInfo: state.scheduling.showSchedule.selectedOpenSpotInfo,
        authenticated: state.auth.authenticated,
    };
}

ShowSchedule.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, {
    setLocation,
    setSubject,
    setCourse,
    setStartDate,
    getOpenSpots,
    selectOpenSpot,
    clearOpenSpotSelection,
    getAvailableTutors,
    displayTutorSelectionModal,
    displayProfileModal,
    displayMessageModal,
})(ShowSchedule);
