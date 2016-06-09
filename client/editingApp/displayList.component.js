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
                <div className="list-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        {config.headers.map((h) => <th key={h}>{h}</th>)}
                        <th className="edit-button-header"></th>
                        <th className="remove-button-header"></th>
                      </tr>
                    </thead>

                    <tbody>
                    {data.map((d) => this.renderDatum(d))}
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

    renderDatum(datum) {
        const { dataProps, headers, keyProp, webLink } = this.props.config;

        // data-header directive is used to create responsive table
        // make a list of td's according to our datum and config
        const dataCols = headers.map((h, i) => {
            let displayValue;
            if (dataProps[i] === Object(dataProps[i])) {
                // if given dataProp is object
                if (datum[dataProps[i].key] === Object(datum[dataProps[i].key])) {
                    displayValue = datum[dataProps[i].key][dataProps[i].display];
                } else {
                    displayValue = 'nil';
                }
            } else {
                displayValue = datum[dataProps[i]];
            }

            return (
                <td data-header={headers[i]} key={h}>
                  {displayValue}
                </td>
            );
        });

        // return a table row with data columns and remove+edit buttons
        return (
            <tr key={datum[keyProp]}>
              {dataCols}
              <td className="icon" data-header="Edit">
                <Link to={`${webLink}/${datum[keyProp]}`}>
                  <i className="fa fa-lg fa-pencil" aria-hidden="true"></i>
                </Link>
              </td>
              <td className="icon" data-header="Remove">
                <i className="fa fa-times"
                   aria-hidden="true"
                   onClick={this.onRemove(datum[keyProp]).bind(this)}></i>
              </td>
            </tr>
        );
    }
}
