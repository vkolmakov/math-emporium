import React from "react";

import ElmWrapper from "@client/components/ElmWrapper";
import ElmModule from "./elm/Managing/Main.elm";
import "@client/style/managing/main.scss";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";

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

function afterElementAvailableInDom(elementId, action) {
    const elementRef = document.getElementById(elementId);

    if (elementRef === null) {
        console.log("trying to get element", elementId);
        return requestAnimationFrame(() =>
            afterElementAvailableInDom(elementId, action)
        );
    }

    return action(elementRef);
}

function initializeDatePicker(elmPortsRef, datePickerInputElement) {
    const datePicker = new Pikaday({
        field: datePickerInputElement,
        onSelect: (date) => {
            elmPortsRef.onDatePickerDateSelection.send({
                timestamp: date.getTime(),
                id: datePickerInputElement.id,
            });
        },
    });

    return datePicker;
}

const ports = (elmPortsRef) => {
    /**
     * Navigation
     */
    let lastSavedScrollPosition = {};

    function onLocationHrefChange() {
        /**
         * This navigation request is initiated from the browser navigation buttons
         * which means that user will likely expect to see the previously observed
         * scroll position (for example, editing an entry and clicking back button to
         * return back to the list of entries).
         */
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

        /**
         * This navigation request is initiated from Elm app, which means that
         * it it very likely coming from a link click. If that happens, we are
         * more than likely don't have to restore the scroll position, as
         * the user would not expect us to mess with the scroll.
         */
        const scrollPosition = null;

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
            // eslint-disable-next-line no-console
            console.warn(
                `requestShowModal elm port: ${modalId} is not a dialog element`
            );
        }
    });

    elmPortsRef.requestCloseModal.subscribe((modalId) => {
        const dialogElement = document.getElementById(modalId);
        if (dialogElement && typeof dialogElement.close === "function") {
            dialogElement.close();
        } else {
            // eslint-disable-next-line no-console
            console.warn(
                `requestCloseModal elm port: ${modalId} is not a dialog element`
            );
        }
    });

    /**
     * Date Pickers
     */
    elmPortsRef.calendarCheckInitializeStartDatePickerElement.subscribe(
        (datePickerInputElementId) => {
            return afterElementAvailableInDom(
                datePickerInputElementId,
                (datePickerInputRef) =>
                    initializeDatePicker(elmPortsRef, datePickerInputRef)
            );
        }
    );

    elmPortsRef.calendarCheckInitializeEndDatePickerElement.subscribe(
        (datePickerInputElementId) => {
            return afterElementAvailableInDom(
                datePickerInputElementId,
                (datePickerInputRef) =>
                    initializeDatePicker(elmPortsRef, datePickerInputRef)
            );
        }
    );

    /**
     * Browser
     */
    elmPortsRef.requestOpenNewBrowserTab.subscribe((url) => {
        window.open(url);
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
