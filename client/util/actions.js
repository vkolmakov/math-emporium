import axios from 'axios';

const BASE_URL_SETTINGS = '/api/public/settings';

export const UT_ROUTE_CHANGE = 'UT_ROUTE_CHANGE';
export const UT_GET_PUBLIC_SETTINGS = 'UT_GET_PUBLIC_SETTINGS';

export function routeChange(routeData) {
    return {
        type: UT_ROUTE_CHANGE,
        payload: routeData,
    };
}

export function setPageTitle(title) {
    document.title = title;
}

export function getPublicApplicationStartupSettings() {
    const REQUIRED_STARTUP_SETTINGS_ITEMS = [
        'applicationTitle',
        'applicationMainHomePictureLink',
    ];
    const REQUESTED_ITEMS_SEPARATOR = ',';

    return (dispatch) => axios.get(BASE_URL_SETTINGS, {
        params: {
            items: REQUIRED_STARTUP_SETTINGS_ITEMS.join(REQUESTED_ITEMS_SEPARATOR),
        },
    }).then((response) => {
        dispatch({
            type: UT_GET_PUBLIC_SETTINGS,
            payload: response.data,
        });

        setPageTitle(response.data.applicationTitle);

        return Promise.resolve();
    }, () => {}); // proceed with default settings on error
}
