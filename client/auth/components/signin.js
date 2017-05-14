import React, { Component } from 'react';
import { OAUTH2_SIGNIN_URL } from '../constants';
import schoolLogo from '../../assets/school-logo.png';


// TODO: pass in selected appointment, if any, in the querystring
export default props => (
  <div className="wrap">
    <div className="auth-form-wrap">
      <a href={OAUTH2_SIGNIN_URL} className="oauth2-link">
        <div className="oauth2-wrap">
          <img alt="School Logo" src={schoolLogo}/>
          <span>Sign in with your school account</span>
        </div>
      </a>
    </div>
  </div>
);
