import settingsStorage from './settingsStorage';
import { R } from '../../aux';
import { getDefaultSettings, updateDefaultSettings } from './settings.service';

const PUBLIC_SETTINGS = [
    settingsStorage.keys.applicationTitle,
];

export function handleGetPublicSettings(req, res, next) {
    return getDefaultSettings()
        .then(R.pick(PUBLIC_SETTINGS))
        .then((result) => res.status(200).json(result),
              (err) => next(err));
}

export function handleGetSettings(req, res, next) {
    return getDefaultSettings()
        .then((result) => res.status(200).json(result),
              (err) => next(err));
}

export function handleUpdateSettings(req, res, next) {
    return updateDefaultSettings(req.body)
        .then((result) => res.status(200).json(result),
              (err) => next(err));
}
