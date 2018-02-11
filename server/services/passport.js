import passport from 'passport';
import { Strategy as AzureAdOAuth2Strategy } from 'passport-azure-ad-oauth2';
import jwt from 'jsonwebtoken';

import mainStorage from './mainStorage';
import { successMessage } from './messages';

import config from '../config';

const azureOptions = {
    clientID: config.azure.CLIENT_ID,
    clientSecret: config.azure.SECRET,
    callbackURL: config.azure.CALLBACK,
    useCommonEndpoint: true,
    response_type: 'id_token',
    scope: ['openid', 'profile'],
    scopeSeparator: '+',
};

const OAUTH_CALLBACK_OPTIONS = {
    failureRedirect: '/',
};

const azureAdOAuth2Login = new AzureAdOAuth2Strategy(azureOptions, async (_aT, _rT, params, _p, done) => {
    const User = mainStorage.db.models.user;
    const userProfile = jwt.decode(params.id_token);

    const email = userProfile.upn;
    const firstName = userProfile.given_name;
    const lastName = userProfile.family_name;

    try {
        const userWithStatus = await User.findOrCreate({ where: { email }, defaults: { firstName, lastName } });
        const [user, _] = userWithStatus;
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

export default {
    middleware: {
        initialize: () => {
            passport.serializeUser((user, done) => {
                done(null, user.id);
            });

            passport.deserializeUser((userId, done) => {
                const User = mainStorage.db.models.user;

                User.findOne({
                    where: { id: userId },
                }).then((user) => {
                    if (!user) {
                        done('No such user exists', false);
                    }
                    done(null, user);
                }, (err) => done(err, false));
            });

            passport.use(azureAdOAuth2Login);

            return [
                passport.initialize(),
                passport.session(),
            ];
        },
    },

    authenticate: {
        azure: () => passport.authenticate('azure_ad_oauth2', OAUTH_CALLBACK_OPTIONS),
    },

    destroySession() {
        return (req, res, next) => {
            if (!!req.session) {
                req.session.destroy((err) => {
                    if (err) {
                        next(err);
                    }

                    return res.status(200).json(successMessage());
                });
            } else {
                return res.status(200).json(successMessage());
            }
        };
    },
};
