import { windowResize } from "@client/util/actions";

export default function attachUtilEventListeners(window, store) {
    // TODO: throttle
    window.addEventListener("resize", (e) => store.dispatch(windowResize(e)));
}
