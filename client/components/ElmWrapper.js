import React, { Component } from "react";

export default class ElmWrapper extends Component {
    componentDidMount() {
        const { flags, ports, src } = this.props;
        const rootRef = this.rootRef;

        const elementToBeReplacedByElm = document.createElement("div");
        rootRef.appendChild(elementToBeReplacedByElm);

        const app = src.init({
            node: elementToBeReplacedByElm,
            flags: flags() || "",
        });

        if (typeof ports === "function") {
            this.portsCleanup = ports(app.ports);
        }
    }

    componentWillUnmount() {
        if (typeof this.portsCleanup === "function") {
            this.portsCleanup();
        }
    }

    static shouldComponentUpdate() {
        return false;
    }

    storeRootRef(ref) {
        this.rootRef = ref;
    }

    render() {
        const { rootElementProps } = this.props;
        return <div {...rootElementProps} ref={this.storeRootRef.bind(this)} />;
    }
}
