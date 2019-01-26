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

function afterElementsAvailableInDom(elementIds, action) {
    const refs = elementIds.map((elementId) =>
        document.getElementById(elementId)
    );

    if (refs.some((ref) => ref === null)) {
        return requestAnimationFrame(() =>
            afterElementsAvailableInDom(elementIds, action)
        );
    }

    return action(refs);
}

function calendarCheckInitializeDateRangePicker(
    elmPortsRef,
    startDatePickerDescription,
    endDatePickerDescription
) {
    const baseDatePickerOptions = {
        firstDate: 1, // set Monday as first day
    };

    const startDatePicker = new Pikaday({
        field: startDatePickerDescription.ref,
        onSelect: (date) => {
            elmPortsRef.onDatePickerDateSelection.send({
                timestamp: date.getTime(),
                id: startDatePickerDescription.ref.id,
            });
            updateStartDate(date);
        },
        ...baseDatePickerOptions,
    });

    const endDatePicker = new Pikaday({
        field: endDatePickerDescription.ref,
        onSelect: (date) => {
            elmPortsRef.onDatePickerDateSelection.send({
                timestamp: date.getTime(),
                id: endDatePickerDescription.ref.id,
            });
            updateEndDate(date);
        },
        ...baseDatePickerOptions,
    });

    function updateStartDate(date) {
        startDatePicker.setStartRange(date);
        endDatePicker.setStartRange(date);
        endDatePicker.setMinDate(date);
    }

    function updateEndDate(date) {
        endDatePicker.setEndRange(date);
        startDatePicker.setEndRange(date);
        startDatePicker.setMaxDate(date);
    }

    if (startDatePickerDescription.timestamp) {
        startDatePicker.setDate(new Date(startDatePickerDescription.timestamp));
    }

    if (endDatePickerDescription.timestamp) {
        endDatePicker.setDate(new Date(endDatePickerDescription.timestamp));
    }
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
    elmPortsRef.calendarCheckInitializeDatePickers.subscribe((message) => {
        const {
            startDatePickerId,
            selectedStartDateTimestamp,
            endDatePickerId,
            selectedEndDateTimestamp,
        } = message;

        return afterElementsAvailableInDom(
            [startDatePickerId, endDatePickerId],
            ([startDatePickerInputRef, endDatePickerInputRef]) =>
                calendarCheckInitializeDateRangePicker(
                    elmPortsRef,
                    {
                        timestamp: selectedStartDateTimestamp,
                        ref: startDatePickerInputRef,
                    },
                    {
                        timestamp: selectedEndDateTimestamp,
                        ref: endDatePickerInputRef,
                    }
                )
        );
    });

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
