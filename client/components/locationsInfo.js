import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Either } from '../utils';

const Location = (location) => {
    const Address = (address) => (
        <p className="address">
          <a className="location-info-link" href={`https://maps.google.com/?q=${address}`}>{address}</a>
        </p>
    );
    const Phone = (phone) => (
        <p className="phone">
          <a className="location-info-link" href={`tel:${phone}`}>{phone}</a>
        </p>
    );
    const Email = (email) => (
        <p className="email">
          <a className="location-info-link" href={`mailto:${email}`}>{email}</a>
        </p>
    );
    const Description = (description) => (<p className="description">{description}</p>);

    const Empty = () => (<span></span>);

    const contacts = {
        address: Either.toEither('', location.address),
        phone: Either.toEither('', location.phone),
        email: Either.toEither('', location.email),
    };

    const description = Either.toEither('', location.description);

    return (
        <li key={location.id} className="locations-info-location-container">
          <p className="name">
            <strong>{location.name}</strong>
          </p>
          {Either.either(Empty, Description, description)}
          <div className="contact-info">
            {Either.either(Empty, Address, contacts.address)}
            {Either.either(Empty, Phone, contacts.phone)}
            {Either.either(Empty, Email, contacts.email)}
          </div>
        </li>
    );
};

class LocationsInfo extends Component {
    render() {
        const locations = this.props.onlySelected
              ? [this.props.locations.selected]
              : this.props.locations.all;


        return (
            <ul className="locations-info">
              {locations.map(Location)}
            </ul>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.scheduling.shared.locations.all,
            selected: state.scheduling.shared.locations.selected,
        },
    };
}

export default connect(mapStateToProps)(LocationsInfo);
