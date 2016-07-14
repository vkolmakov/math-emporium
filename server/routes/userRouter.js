import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';

const requireSignin = passport.authenticate('jwt', { session: false });

export default function createUserRouter() {
    const controller = require('../users/users.controller');
    const router = express.Router();

    router.get('/user/profile', requireSignin, controller.getProfile);
    router.put('/user/profile', requireSignin, controller.updateProfile);

    return router;
}
