import React, { Component } from 'react';
import { Link } from 'react-router';

export default class TableAction extends Component {
    constructor() {
        super();
        this.state = { isConfirmed: false };
    }

    render() {
        const { action, datum } = this.props;
        const param = datum.id;
        let onClick;
        let url;

        const isWaitingForConfirmation = action.requestConfirmation && this.state.isConfirmed;
        let label = isWaitingForConfirmation
            ? 'Click again to proceed'
            : action.label;

        const tableActionClassName = isWaitingForConfirmation
              ? 'table-action action-confirmation-required'
              : 'table-action';

        let LinkElem;

        if (action.requestConfirmation && !this.state.isConfirmed) {
            // wait until next click before performing the action
            onClick = () => this.setState({ isConfirmed: true });
            LinkElem = () => (
                <span className="action-text">
                    {label}
                </span>);
        } else if (typeof action.action === 'string') {
            // got a URL
            url = `${action.action}/${param}`;
            onClick = () => {};
            LinkElem = () => (
                <Link to={url} className="action-text">
                    {label}
                </Link>);
        } else if (typeof action.action === 'function') {
            // got a regular action
            onClick = () => {
                action.action.call(null, param);
            };
            LinkElem = () => (
                <span className="action-text">
                    {label}
                </span>);
        }

        return (
            <td onClick={onClick}
                className={tableActionClassName}>
                <LinkElem />
            </td>
        );
    }
}
