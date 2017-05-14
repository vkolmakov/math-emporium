import React, { Component } from 'react';
import { OAUTH2_SIGNIN_URL } from '../constants';
import schoolLogo from '../../assets/school-logo.png';


export default props => (
  <div className="wrap">
    <div className="auth-form-wrap">
      <div class="oauth2-wrap">
        <img alt="School Logo" src={schoolLogo}/>
        <a href={OAUTH2_SIGNIN_URL} className="oauth2-link">Sign in with your school account</a>
      </div>
    </div>
  </div>
);
