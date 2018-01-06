export const WINDOW_RESIZE = 'WINDOW_RESIZE';

export function windowResize(e) {
    return {
        type: WINDOW_RESIZE,
        payload: {
            rawEvent: e,
            window: window,
        },
    };
}
