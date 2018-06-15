import { R } from "../../aux";
import settingsStorage from "./settingsStorage";
import faq from "../faq";

export const SETTINGS_KEYS = settingsStorage.keys;

export const PUBLIC_SETTINGS_KEYS = [
    SETTINGS_KEYS.applicationTitle,
    SETTINGS_KEYS.applicationMainHomePictureLink,
    SETTINGS_KEYS.faqContent,
    SETTINGS_KEYS.announcementContent,
    SETTINGS_KEYS.announcementBackgroundColor,
    SETTINGS_KEYS.announcementTextColor,
];

export function getDefaultSettings() {
    return settingsStorage.getDefaultSettings();
}

const transform = {
    addFaqContentTransformation(settingsValues) {
        return {
            ...settingsValues,
            [SETTINGS_KEYS.faqContent]: faq.compileToHtml(
                settingsValues[SETTINGS_KEYS.faqText],
            ),
        };
    },

    addAnnouncementContentTransformation(settingsValues) {
        return {
            ...settingsValues,
            [SETTINGS_KEYS.announcementContent]: faq.compileToHtml(
                settingsValues[SETTINGS_KEYS.announcementText],
            ),
        };
    },

    convertMaximumAppointmentsPerUserToNumberOrDefault(settingsValues) {
        const DEFAULT_VALUE = 0;
        const maximumAppointmentsPerUser = parseInt(
            settingsValues[SETTINGS_KEYS.maximumAppointmentsPerUser],
            10,
        );

        return {
            ...settingsValues,
            [SETTINGS_KEYS.maximumAppointmentsPerUser]: isNaN(
                maximumAppointmentsPerUser,
            )
                ? DEFAULT_VALUE
                : maximumAppointmentsPerUser,
        };
    },
};

export function updateDefaultSettings(values) {
    const transformations = [
        transform.addFaqContentTransformation,
        transform.addAnnouncementContentTransformation,
        transform.convertMaximumAppointmentsPerUserToNumberOrDefault,
    ];

    const validSettingsKeys = Object.keys(SETTINGS_KEYS);
    const updatedValues = transformations.reduce(
        (acc, transformation) => transformation(acc),
        values,
    );

    return settingsStorage
        .updateDefaultSettings(R.pick(validSettingsKeys, updatedValues))
        .then((settingsDocument) => settingsDocument.values);
}

export function getSettingsValue(key) {
    return getDefaultSettings().then((settings) => settings[key]);
}
