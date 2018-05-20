import React from 'react';
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

export default ({ appointments, courses, locations }) => {
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
