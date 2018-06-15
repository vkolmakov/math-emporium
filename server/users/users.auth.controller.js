import { successMessage } from "../services/messages";

function updateLastSignInStatus(user) {
    const now = Date.now();
    return user.update({ lastSigninAt: now });
}

export function signin(logEvent) {
    return (req, res, next) => {
        const user = req.user;
        const { group, email } = user.dataValues;
        const data = {
            group,
            email,
        };

        // sending public data
        Object.keys(data).forEach((k) =>
            res.cookie(k, data[k], { httpOnly: false }),
        );

        const redirectToRoot = () => res.redirect("/");

        return logEvent(req)
            .then(() => updateLastSignInStatus(user))
            .then(redirectToRoot)
            .catch(redirectToRoot);
    };
}

export function recordSignin() {
    return (req, res, next) => {
        const user = req.user;

        return updateLastSignInStatus(user).then(
            () => res.status(200).json(successMessage()),
            next,
        );
    };
}
