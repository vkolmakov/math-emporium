import { browserHistory } from 'react-router';

import { windowResize, routeChange } from './actions';

export default function attachUtilEventListeners(window, store) {
    window.addEventListener('resize', (e) => store.dispatch(windowResize(e)));
    browserHistory.listen((location, _) => store.dispatch(routeChange({ path: location.pathname })));
}
