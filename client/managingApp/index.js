import React from "react";

import ElmWrapper from "@client/components/ElmWrapper";
import ElmModule from "./elm/Managing/Main.elm";

const Managing = ElmModule.Elm.Managing;

const rootElementProps = {
    id: "main",
    className: "page-section",
    tabIndex: -1,
};

const ports = (elmPortsRef) => {
    function onLocationHrefChange() {
        elmPortsRef.onLocationHrefChange.send(location.href);
    }

    window.addEventListener("popstate", onLocationHrefChange);

    elmPortsRef.pushLocationHrefChange.subscribe((href) => {
        history.pushState({}, "", href);
        elmPortsRef.onLocationHrefChange.send(location.href);
    });

    return function portsCleanup() {
        window.removeEventListener("popstate", onLocationHrefChange);
    };
};

export default () => (
    <ElmWrapper
        rootElementProps={rootElementProps}
        src={Managing.Main}
        flags={location.href}
        ports={ports}
    />
);
