import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import db from 'sequelize-connect';
const SECRET = 'this is supersecret';

const localOptions = {
    usernameField: 'email',
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    const User = db.models.user;
    try {
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            done(null, false);
        }

        user.validatePassword(password, (err, isMatch) => {
            if (err) {
                done(err);
            } else if (!isMatch) {
                done(null, false);
            } else {
                done(null, user);
            }
        });
    } catch (err) {
        console.log(err);
        return done(err);
    }
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: SECRET,
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
