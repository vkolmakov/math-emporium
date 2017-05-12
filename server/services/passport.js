import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import config from '../config';

import db from 'sequelize-connect';

const localOptions = {
    usernameField: 'email',
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    const User = db.models.user;
    try {
        const user = await User.findOne({
            where: {
                email,
                active: true,
            },
        });

        if (!user) {
            done(null, false);
        }

        const isMatch = await user.validatePassword(password);

        if (isMatch) {
            done(null, user);
        } else {
            done(null, false);
        }
    } catch (err) {
        console.log(err);
        return done(err);
    }
});

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


passport.use(jwtLogin);
passport.use(localLogin);
