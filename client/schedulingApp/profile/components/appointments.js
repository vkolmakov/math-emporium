import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { TIMESTAMP_DISPLAY_FORMAT } from '../../../constants';
import LoadingSpinner from '../../../components/loadingSpinner';

const SingleAppointment = (courses, locations, createAppointmentCancelClickHandler) => ({ id, location, course, time }) => {
    const locationName = locations.find((l) => l.id === location.id).name;
    const courseCode = courses.find((c) => c.id === course.id).code;
    const formattedTime = moment(time).format(TIMESTAMP_DISPLAY_FORMAT);

    return (
        <div key={id} className="individual-appointment">
          <div className="individual-appointment-description">
            <div className="details">
              {courseCode} at {locationName}
            </div>
            <div className="time">
              on {formattedTime}
            </div>
          </div>

          <div className="individual-appointment-actions">
            <button onClick={createAppointmentCancelClickHandler(id)}>Cancel</button>
          </div>
        </div>
    );
};

const _Appointments = ({ appointments, courses, locations }) => {
    const createAppointmentCancelClickHandler = (id) => (event) => {
        console.log('Deleting appointment', id, event);
    };

    const AppointmentsOrSpinner = () => !!appointments ? (
        <div>
          {appointments.map(SingleAppointment(courses, locations, createAppointmentCancelClickHandler))}
        </div>
    ) : (<LoadingSpinner></LoadingSpinner>);

    return (
        <div className="appointments">
          <h2>Appointments</h2>
          <AppointmentsOrSpinner></AppointmentsOrSpinner>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        appointments: state.scheduling.profile.activeUserAppointments,
        courses: state.scheduling.shared.courses.all,
        locations: state.scheduling.shared.locations.all,
    };
}

export default connect(mapStateToProps)(_Appointments);
