import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';
import requireGroup from '../middleware/requireGroup';
import createEventLogger from '../middleware/logEvent';
import { authGroups, events } from '../aux';

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

    router.get('/auth/oauth2/signin',
               requireSignin());
    router.get('/auth/oauth2/callback',
               requireSignin(),
               controller.signin(createEventLogger(events.USER_SIGNED_IN)));

    router.post('/auth/record-signin',
                requireGroup(authGroups.USER),
                controller.recordSignin());

    return router;
}
