import { R } from "../../aux";
import {
    getDefaultSettings,
    updateDefaultSettings,
    PUBLIC_SETTINGS_KEYS,
} from "./settings.service";

const REQUESTED_ITEMS_SEPARATOR = ",";

export function handleGetPublicSettings(req, res, next) {
    const requestedKeys = !!req.query.items
        ? req.query.items.split(REQUESTED_ITEMS_SEPARATOR)
        : PUBLIC_SETTINGS_KEYS;

    return getDefaultSettings()
        .then(R.pick(PUBLIC_SETTINGS_KEYS))
        .then(R.pick(requestedKeys))
        .then((result) => res.status(200).json(result), (err) => next(err));
}

export function handleGetSettings(req, res, next) {
    return getDefaultSettings().then(
        (result) => res.status(200).json(result),
        (err) => next(err),
    );
}

export function handleUpdateSettings(req, res, next) {
    return updateDefaultSettings(req.body).then(
        (result) => res.status(200).json(result),
        (err) => next(err),
    );
}
