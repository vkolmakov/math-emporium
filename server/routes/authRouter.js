import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';

const requireSignin = passport.authenticate('local', { session: false });

export default function createAuthRouter() {
    const controller = require('../users/users.controller');
    const router = express.Router();

    router.post('/public/signin', requireSignin, controller.signin);
    router.post('/public/signup', controller.signup);

    return router;
}
