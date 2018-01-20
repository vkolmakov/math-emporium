import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Either, backgroundPictureStyle, backgroundPictureOverlayStyle } from '../utils';

function openInNewTab(event) {
    event.preventDefault();
    window.open(event.target.href);
}

function createMapLink(address) {
    return `https://maps.google.com/?q=${address}`;
}

const Location = ({ shouldDisplayImageBackground, onLocationTitleClick, getLocationTitleLink }) => (location) => {
    const Title = ({ location, onClick, getLocationLink }) => {
        if (typeof onClick === 'function' && typeof getLocationLink === 'function') {
            return (
                <Link onClick={() => onClick(location)} to={getLocationLink(location)} className="name">
                  <strong>{location.name}</strong>
                </Link>
            );
        }

        return (
            <p className="name">
              <strong>{location.name}</strong>
            </p>
        );
    };

    const Address = (address) => (
        <p className="address">
          <a onClick={openInNewTab} className="location-info-link" href={createMapLink(address)}>{address}</a>
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
    const Description = (description) => {
        const toDescriptionParagraph = (tok, i) => (
            <p key={`${location.id}-description-${i}`} className="description">{tok}</p>
        );
        return description.split('\n').map(toDescriptionParagraph);
    };

    const Empty = () => (<span></span>);

    const contacts = {
        address: Either.toEither('', location.address),
        phone: Either.toEither('', location.phone),
        email: Either.toEither('', location.email),
    };

    const description = Either.toEither('', location.description);

    return (
        <li key={location.id} className="locations-info-location-container" style={shouldDisplayImageBackground ? backgroundPictureStyle(location.pictureLink) : {}}>
          <div className="location-info-location-overlay" style={shouldDisplayImageBackground ? backgroundPictureOverlayStyle() : {}}>
            <div className="location-info-location-data">
              <Title location={location} onClick={onLocationTitleClick} getLocationLink={getLocationTitleLink}></Title>
              {Either.either(Empty, Description, description)}
              <div className="contact-info">
                {Either.either(Empty, Address, contacts.address)}
                {Either.either(Empty, Phone, contacts.phone)}
                {Either.either(Empty, Email, contacts.email)}
              </div>
            </div>
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
              {locations.map(Location(this.props))}
            </ul>
        );
    }
}

function mapStateToProps(state) {
    return {
        locations: {
            all: state.sharedPublicData.locations.all,
            selected: state.scheduling.shared.locations.selected,
        },
    };
}

export default connect(mapStateToProps)(LocationsInfo);
