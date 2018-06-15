import React from 'react';
import { Link } from 'react-router-dom';

export default ({ to, children, ...other }) => (
    <Link to={to} {...other}>
      {children}
    </Link>
)
