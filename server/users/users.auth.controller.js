import jwt from 'jwt-simple';

import { successMessage } from '../services/messages';
import config from '../config';

const SECRET = config.SECRET;

function updateLastSignInStatus(user) {
    const now = Date.now();
    return user.update({ lastSigninAt: now });
}

export function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.dataValues.id, iat: timestamp }, SECRET);
}

export function signin(logEvent) {
    return (req, res, next) => {
        const user = req.user;
        const { group, email } = user.dataValues;
        const data = {
            group,
            email,
            token: tokenForUser(user),
        };

        Object.keys(data).forEach(k => res.cookie(k, data[k], { httpOnly: false }));

        const redirectToRoot = () => res.redirect('/');

        return logEvent(req)
            .then(() => updateLastSignInStatus(user))
            .then(redirectToRoot)
            .catch(redirectToRoot);
    };
}

export function recordSignin() {
    return (req, res, next) => {
        const user = req.user;

        return updateLastSignInStatus(user).then(
            () => res.status(200).json(successMessage()),
            next
        );
    };
}
