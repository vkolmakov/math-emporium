import axios from 'axios';

const BASE_URL_SETTINGS = '/api/public/settings';

export const UT_ROUTE_CHANGE = 'UT_ROUTE_CHANGE';

export const UT_GET_PUBLIC_SETTINGS = 'UT_GET_PUBLIC_SETTINGS';
export const UT_GET_PUBLIC_SETTINGS_DELTA = 'UT_GET_PUBLIC_SETTINGS_DELTA';

export const UT_DISPLAY_ANNOUNCEMENT = 'UT_DISPLAY_ANNOUNCEMENT';
export const UT_HIDE_ANNOUNCEMENT = 'UT_HIDE_ANNOUNCEMENT';

export function routeChange(routeData) {
    return {
        type: UT_ROUTE_CHANGE,
        payload: routeData,
    };
}

export function setPageTitle(title) {
    document.title = title;
}

export function displayAnnouncement() {
    return {
        type: UT_DISPLAY_ANNOUNCEMENT,
    };
}

export function hideAnnouncement() {
    return {
        type: UT_HIDE_ANNOUNCEMENT,
    };
}

function getSettings(keys) {
    const REQUESTED_ITEMS_SEPARATOR = ',';

    return axios.get(BASE_URL_SETTINGS, {
        params: {
            items: keys.join(REQUESTED_ITEMS_SEPARATOR),
        },
    });
}

export function getAndApplyPublicApplicationStartupSettings() {
    const REQUIRED_STARTUP_SETTINGS_ITEMS = [
        'applicationTitle',
        'applicationMainHomePictureLink',
        'announcementContent',
        'announcementBackgroundColor',
        'announcementTextColor',
    ];

    return (dispatch) => getSettings(REQUIRED_STARTUP_SETTINGS_ITEMS).then((response) => {
        dispatch({
            type: UT_GET_PUBLIC_SETTINGS,
            payload: response.data,
        });

        setPageTitle(response.data.applicationTitle);

        if (!!response.data.announcementContent) {
            dispatch({
                type: UT_DISPLAY_ANNOUNCEMENT,
            });
        }

        return Promise.resolve();
    }, () => {}); // proceed with default settings on error
}

export function getFaqContent() {
    return (dispatch) => getSettings(['faqContent']).then((response) => {
        dispatch({
            type: UT_GET_PUBLIC_SETTINGS_DELTA,
            payload: response.data,
        });

        return Promise.resolve();
    });
}
