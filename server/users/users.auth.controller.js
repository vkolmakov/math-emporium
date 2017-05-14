import jwt from 'jwt-simple';

import { successMessage } from '../services/messages';
import config from '../config';

const SECRET = config.SECRET;


export const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.dataValues.id, iat: timestamp }, SECRET);
};

export const signin = (req, res, next) => {
    const user = req.user;
    const { group, email } = user.dataValues;
    const data = {
        group,
        email,
        token: tokenForUser(user),
    };

    Object.keys(data).forEach(k => res.cookie(k, data[k], { httpOnly: false }));
    res.redirect('/');
};

export const recordSignin = async (req, res, next) => {
    const user = req.user;
    const now = Date.now();

    try {
        await user.update({ lastSigninAt: now });
    } catch (err) {
        return next(err);
    }

    return res.status(200).json(successMessage());
};
