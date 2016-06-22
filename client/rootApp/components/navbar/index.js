import React from 'react';
import { Link } from 'react-router';

export default () => (
    <nav>
      <Link to="#">Schedule</Link>
      <Link to="/edit-schedule/">Edit-schedule</Link>
      <Link to="#">Login</Link>
      <Link to="#">Register</Link>
    </nav>
);
