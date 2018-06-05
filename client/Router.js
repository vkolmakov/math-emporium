import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './rootApp/index';
import Home from './rootApp/components/home/index';

export default class Router extends Component {
    render() {
        return (
            <BrowserRouter>
              <div>
                <Route path="/" component={App}></Route>
                <Route exact path="/" component={Home}></Route>
              </div>
            </BrowserRouter>
        );
    }
}
