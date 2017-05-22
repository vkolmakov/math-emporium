import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as AzureAdOAuth2Strategy } from 'passport-azure-ad-oauth2';
import jwt from 'jsonwebtoken';
import db from 'sequelize-connect';

import config from '../config';


const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.SECRET,
};


const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    const User = db.models.user;
    const user = await User.findOne({
        where: { id: payload.sub },
    });

    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
});

const azureOptions = {
    clientID: config.azure.CLIENT_ID,
    clientSecret: config.azure.SECRET,
    callbackURL: config.azure.CALLBACK,
    useCommonEndpoint: true,
    response_type: 'id_token',
    scope: ['openid', 'profile'],
    scopeSeparator: '+',
};

const azureAdOAuth2Login = new AzureAdOAuth2Strategy(azureOptions, async (_aT, _rT, params, _p, done) => {
    const User = db.models.user;
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

passport.use(jwtLogin);
passport.use(azureAdOAuth2Login);
