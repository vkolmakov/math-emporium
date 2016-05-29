import React, { Component } from 'react';

export default class EditLocations extends Component {
    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)}>
              <label className="form-header">Add a New Location</label>
              <div className="form-field">
                <label>Name</label>
                <div className="form-input-group">
                  <input type="text" placeholder="Enter New Location Name"/>
                  <span className="form-help">Helper text</span>
                </div>
              </div>
              <div className="form-field">
                <button type="submit" className="button">Submit</button>
              </div>
            </form>
        );
    }

    onSubmit(e) {
        e.preventDefault();
        console.log('Form submitted!');
    }
}
