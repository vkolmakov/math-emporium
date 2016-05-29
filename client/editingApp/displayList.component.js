import React, { Component } from 'react';
import { Link } from 'react-router';

import axios from 'axios';


/*
 * Takes in data list
 *          config object
 *          updateData function
*/
export default class DisplayList extends Component {
    render() {
        const { data, config } = this.props;
        const title = config.title;

        if (!data) {
            return <div className="loading">Loading...</div>;
        } else {
            return (
                <div className="container">
                  <h3>{title}</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        {config.headers.map((h) => <th key={h}>{h}</th>)}
                        <th className="edit-button-header"></th>
                        <th className="remove-button-header"></th>
                      </tr>
                    </thead>

                    <tbody>
                    {data.map((d) => this.renderData(d))}
                    </tbody>
                  </table>
                </div>
            );
        }
    }

    onRemove(id) {
        // creates a closure that remembers id of a selected element
        return (event) => {
            // update data as soon as request is complete
            axios.delete(`${this.props.config.apiLink}/${id}`)
            .then((res) => {
                this.props.updateData();
            });
        };
    }

    renderData(datum) {
        const { dataProps, headers, keyProp, webLink } = this.props.config;

        // data-header directive is used to create responsive table
        // make a list of td's according to our datum and config

        // TODO: add rendering for complex properties and lists
        const dataCols = headers.map((h, i) => (
            <td data-header={headers[i]} key={h}>
              {datum[dataProps[i]]}
            </td>
        ));

        // return a table row with data columns and remove+edit buttons
        return (
            <tr key={datum[keyProp]}>
              {dataCols}
              <td className="icon">
                <Link to={`${webLink}/${datum[keyProp]}`}>
                  <i className="fa fa-lg fa-pencil" aria-hidden="true"></i>
                </Link>
              </td>
              <td className="icon">
                <i className="fa fa-times"
                   aria-hidden="true"
                   onClick={this.onRemove(datum[keyProp]).bind(this)}></i>
              </td>
            </tr>
        );
    }
}
