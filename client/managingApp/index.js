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

const flags = () => ({
    initialHref: location.href,
    localTimezoneOffsetInMinutes: new Date().getTimezoneOffset(),
});

const getScrollPosition = () => ({
    x: window.pageXOffset,
    y: window.pageYOffset,
});

const ports = (elmPortsRef) => {
    /**
     * Navigation
     */
    let lastSavedScrollPosition = {};

    function onLocationHrefChange() {
        // read last saved scroll position on browser-initiated navigation
        const scrollPosition = lastSavedScrollPosition[location.href] || null;
        elmPortsRef.onLocationHrefChange.send({
            href: location.href,
            scrollPosition,
        });
    }

    window.addEventListener("popstate", onLocationHrefChange);

    elmPortsRef.pushLocationHrefChange.subscribe((requestedPathname) => {
        // write last saved scroll position when navigation was initiated inside Elm app
        lastSavedScrollPosition[location.href] = getScrollPosition();

        history.pushState({}, "", requestedPathname);

        // check if there is a position associated with the new href must happen AFTER pushState
        const scrollPosition = lastSavedScrollPosition[location.href] || null;

        elmPortsRef.onLocationHrefChange.send({
            href: location.href,
            scrollPosition,
        });
    });

    /**
     * Modals
     */
    elmPortsRef.requestShowModal.subscribe((modalId) => {
        const dialogElement = document.getElementById(modalId);
        if (dialogElement && typeof dialogElement.showModal === "function") {
            dialogElement.showModal();
            document.body.classList.add("utility__disable-scroll");

            const onDialogClose = () => {
                document.body.classList.remove("utility__disable-scroll");
                dialogElement.removeEventListener("close", onDialogClose);
            };
            dialogElement.addEventListener("close", onDialogClose);
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
