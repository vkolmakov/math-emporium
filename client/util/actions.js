export const ROUTE_CHANGE = 'ROUTE_CHANGE';

export function routeChange(routeData) {
    return {
        type: ROUTE_CHANGE,
        payload: routeData,
    };
}
