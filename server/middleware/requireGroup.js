import passport from 'passport';
import passportService from '../services/passport';

export default function requireGroup(groupId) {
    return [
        passport.authenticate('jwt', { session: false }),
        function(req, res, next) {
            const user = req.user;
            if (user && user.dataValues.group >= groupId) {
                next();
            } else {
                res.status(401).send('Unathorized');
            }
        },
    ];
}
