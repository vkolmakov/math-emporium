import { R } from '../../aux';
import settingsStorage from './settingsStorage';

export function getDefaultSettings() {
    return settingsStorage.getDefaultSettings();
}

export function updateDefaultSettings(updatedValues) {
    const validSettingsKeys = Object.keys(settingsStorage.keys);
    return settingsStorage.updateDefaultSettings(R.pick(validSettingsKeys, updatedValues));
}
