import React from "react";

import ElmWrapper from "@client/components/ElmWrapper";
import ElmModule from "./elm/Managing/Main.elm";
import "@client/style/managing/main.scss";

const Managing = ElmModule.Elm.Managing;

const rootElementProps = {
    id: "main",
    className: "page-section",
    tabIndex: -1,
};

const flags = {
    initialHref: location.href,
    localTimezoneOffsetInMinutes: new Date().getTimezoneOffset(),
};

const ports = (elmPortsRef) => {
    /**
     * Navigation
     */
    function onLocationHrefChange() {
        elmPortsRef.onLocationHrefChange.send(location.href);
    }

    window.addEventListener("popstate", onLocationHrefChange);

    elmPortsRef.pushLocationHrefChange.subscribe((href) => {
        history.pushState({}, "", href);
        elmPortsRef.onLocationHrefChange.send(location.href);
    });

    /**
     * Modals
     */
    elmPortsRef.requestShowModal.subscribe((modalId) => {
        const dialogElement = document.getElementById(modalId);
        if (dialogElement && typeof dialogElement.showModal === "function") {
            dialogElement.showModal();
        } else {
            console.warn(
                `requestShowModal elm port: ${modalId} is not a dialog element`
            );
        }
    });

    return function portsCleanup() {
        window.removeEventListener("popstate", onLocationHrefChange);
    };
};

export default () => (
    <ElmWrapper
        rootElementProps={rootElementProps}
        src={Managing.Main}
        flags={flags}
        ports={ports}
    />
);
