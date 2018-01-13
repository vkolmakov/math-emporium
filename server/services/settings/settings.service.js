import { R } from '../../aux';
import settingsStorage from './settingsStorage';

export const SETTINGS_KEYS = settingsStorage.keys;

export const PUBLIC_SETTINGS_KEYS = [
    SETTINGS_KEYS.applicationTitle,
];

export function getDefaultSettings() {
    return settingsStorage.getDefaultSettings();
}

export function updateDefaultSettings(updatedValues) {
    const validSettingsKeys = Object.keys(SETTINGS_KEYS);
    return settingsStorage.updateDefaultSettings(R.pick(validSettingsKeys, updatedValues))
        .then((settingsDocument) => settingsDocument.values);
}

export function getValue(key) {
    return getDefaultSettings()
        .then((settings) => settings[key]);
}
