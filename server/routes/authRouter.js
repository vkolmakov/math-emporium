import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';
import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

function requireSignin() {
    const oauthOptions = {
        failureRedirect: '/',
        session: false,
    };
    return passport.authenticate('azure_ad_oauth2', oauthOptions);
}

export default function createAuthRouter() {
    const controller = require('../users/users.auth.controller');
    const router = express.Router();

    router.get('/auth/oauth2/signin', requireSignin());
    router.get('/auth/oauth2/callback', requireSignin(), controller.signin);

    router.post('/auth/record-signin', requireGroup(AUTH_GROUPS.user), controller.recordSignin);

    return router;
}
