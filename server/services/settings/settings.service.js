import { R } from '../../aux';
import settingsStorage from './settingsStorage';
import faq from '../faq';

export const SETTINGS_KEYS = settingsStorage.keys;

export const PUBLIC_SETTINGS_KEYS = [
    SETTINGS_KEYS.applicationTitle,
    SETTINGS_KEYS.applicationMainHomePictureLink,
    SETTINGS_KEYS.faqContent,
];

export function getDefaultSettings() {
    return settingsStorage.getDefaultSettings();
}

function addFaqContentTransformation(settingsValues) {
    return {
        ...settingsValues,
        [SETTINGS_KEYS.faqContent]: faq.compileToHtml(settingsValues[SETTINGS_KEYS.faqText]),
    };
}

export function updateDefaultSettings(values) {
    const transformations = [
        addFaqContentTransformation,
    ];

    const validSettingsKeys = Object.keys(SETTINGS_KEYS);
    const updatedValues = transformations.reduce((acc, transformation) => transformation(acc), values);

    return settingsStorage.updateDefaultSettings(R.pick(validSettingsKeys, updatedValues))
        .then((settingsDocument) => settingsDocument.values);
}

export function getSettingsValue(key) {
    return getDefaultSettings()
        .then((settings) => settings[key]);
}
