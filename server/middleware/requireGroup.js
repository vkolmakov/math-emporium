import { unauthorized } from "../services/errorMessages";

const unauthorizedRequest = (req, res) => res.status(401).send(unauthorized());

export default function requireGroup(groupId) {
    const ensureUser = (req, res, next) => {
        if (req.user) {
            return next();
        }

        return unauthorizedRequest(req, res);
    };

    const ensureRequiredGroup = (req, res, next) => {
        const user = req.user;
        if (user && user.dataValues.group >= groupId) {
            return next();
        }

        return unauthorizedRequest(req, res);
    };

    return [ensureUser, ensureRequiredGroup];
}
