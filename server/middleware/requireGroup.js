import { unathorized } from "../services/errorMessages";

const unathorizedRequest = (req, res) => res.status(401).send(unathorized());

export default function requireGroup(groupId) {
    const ensureUser = (req, res, next) => {
        if (req.user) {
            return next();
        }

        return unathorizedRequest(req, res);
    };

    const ensureRequiredGroup = (req, res, next) => {
        const user = req.user;
        if (user && user.dataValues.group >= groupId) {
            return next();
        }

        return unathorizedRequest(req, res);
    };

    return [ensureUser, ensureRequiredGroup];
}
