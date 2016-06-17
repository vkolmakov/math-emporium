import React from 'react';
import { Link } from 'react-router';

import { BASE_PATH } from '../../constants';

export default () => {
    return (
        <div className="sidebar">
          <ul>
            <li><Link to={`/${BASE_PATH}/locations`}>Locations</Link></li>
            <li><Link to={`/${BASE_PATH}/courses`}>Courses</Link></li>
            <li><Link to={`/${BASE_PATH}/tutors`}>Tutors</Link></li>
            <li><Link to={`/${BASE_PATH}/schedules`}>Schedules</Link></li>
          </ul>

          <ul>
            <li><Link to={`/${BASE_PATH}/schedules-overview`}>Schedules overview</Link></li>
            <li><Link to={`/${BASE_PATH}/tutors-overview`}>Tutors overview</Link></li>
          </ul>
        </div>
    );
};
