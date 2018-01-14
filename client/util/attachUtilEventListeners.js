import { browserHistory } from 'react-router';

import { routeChange } from './actions';

export default function attachUtilEventListeners(window, store) {
    browserHistory.listen((location, _) => store.dispatch(routeChange({ path: location.pathname })));
}
