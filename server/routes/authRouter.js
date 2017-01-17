import express from 'express';

import passport from 'passport';
import passportService from '../services/passport';
import requireGroup from '../middleware/requireGroup';
import { AUTH_GROUPS } from '../aux';

const requireSignin = passport.authenticate('local', { session: false });

export default function createAuthRouter() {
    const controller = require('../users/users.auth.controller');
    const router = express.Router();

    router.post('/auth/signin', requireSignin, controller.signin);
    router.post('/auth/signup', controller.signup);
    router.post('/auth/activate', controller.activate);
    router.post('/auth/resend-activation-email', controller.resendActivationEmail);
    router.post('/auth/send-reset-password-email', controller.requestResetPassword);
    router.post('/auth/reset-password', controller.resetPassword);
    router.post('/auth/record-signin', requireGroup(AUTH_GROUPS.user), controller.recordSignin);

    return router;
}
