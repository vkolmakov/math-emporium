import axios from 'axios';

import { storage } from '../utils';

const BASE_URL_SETTINGS = '/api/public/settings';

export const UT_GET_PUBLIC_SETTINGS = 'UT_GET_PUBLIC_SETTINGS';
export const UT_GET_PUBLIC_SETTINGS_DELTA = 'UT_GET_PUBLIC_SETTINGS_DELTA';

export const UT_DISPLAY_ANNOUNCEMENT = 'UT_DISPLAY_ANNOUNCEMENT';
export const UT_HIDE_ANNOUNCEMENT = 'UT_HIDE_ANNOUNCEMENT';

export function setPageTitle(title) {
    document.title = title;
}

export function displayAnnouncement() {
    return {
        type: UT_DISPLAY_ANNOUNCEMENT,
    };
}

export function hideAnnouncement(announcementContent) {
    function persistHiddenAnnouncementForSession() {
        storage.set(storage.KEYS.ANNOUNCEMENT_CONTENT_REQUESTED_TO_BE_HIDDEN, announcementContent);
    }

    persistHiddenAnnouncementForSession();

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

    function wasGivenAnnouncementRequestedToBeHidden(announcement) {
        return storage.get(storage.KEYS.ANNOUNCEMENT_CONTENT_REQUESTED_TO_BE_HIDDEN) === announcement;
    }

    return (dispatch) => getSettings(REQUIRED_STARTUP_SETTINGS_ITEMS).then((response) => {
        const settings = response.data;
        const { applicationTitle, announcementContent } = settings;

        dispatch({
            type: UT_GET_PUBLIC_SETTINGS,
            payload: settings,
        });

        setPageTitle(applicationTitle);

        if (!!announcementContent && !wasGivenAnnouncementRequestedToBeHidden(announcementContent)) {
            dispatch(displayAnnouncement());
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
