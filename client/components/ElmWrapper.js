import React, { Component } from "react";

export default class ElmWrapper extends Component {
    componentDidMount() {
        const { flags, ports, src } = this.props;
        const rootRef = this.rootRef;

        const app = src.embed(rootRef, flags);

        if (typeof ports === "function") {
            ports(app.ports);
        }
    }

    static shouldComponentUpdate() {
        return false;
    }

    storeRootRef = (ref) => {
        this.rootRef = ref;
    };

    render() {
        return <div ref={this.storeRootRef} />;
    }
}
