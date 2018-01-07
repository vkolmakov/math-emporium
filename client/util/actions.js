export const WINDOW_RESIZE = 'WINDOW_RESIZE';
export const ROUTE_CHANGE = 'ROUTE_CHANGE';

export function windowResize(e) {
    return {
        type: WINDOW_RESIZE,
        payload: {
            rawEvent: e,
            window: window,
        },
    };
}

export function routeChange(routeData) {
    return {
        type: ROUTE_CHANGE,
        payload: routeData,
    };
}
