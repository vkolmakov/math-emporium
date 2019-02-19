import React from "react";

let mainElementKeyboardFocusTimeout;

/**
 * @desc Adds styles that provide a focus indication when skip link
 * to main content was used. This is done to avoid seeing the focus indication
 * on regular page clicks that are not triggered through skip links.
 */
function onMainContentSelection() {
    const mainContentElement = document.getElementById("main");

    if (mainContentElement && !mainElementKeyboardFocusTimeout) {
        mainContentElement.classList.add("was-keyboard-focused");
        mainElementKeyboardFocusTimeout = window.setTimeout(
            function removeKeyboardFocusIndicationMainContent() {
                mainContentElement.classList.remove("was-keyboard-focused");
                mainElementKeyboardFocusTimeout = void 0;
            },
            1000
        );
    }
}

export default () => (
    <ul className="skip-links">
        <li>
            <a href="#main" onClick={onMainContentSelection}>
                Skip to content
            </a>
        </li>
    </ul>
);
