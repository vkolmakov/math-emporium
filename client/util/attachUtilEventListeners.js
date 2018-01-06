import { windowResize } from './actions';

export default function attachUtilEventListeners(window, store) {
    window.addEventListener('resize', (e) => store.dispatch(windowResize(e)));
}
