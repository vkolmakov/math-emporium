import session from "express-session";

import sessionStorage from "../services/sessionStorage";
import config from "../config";

export default () => {
    const store = sessionStorage.create(session);

    return session({
        secret: config.SECRET,

        store,
        resave: false,
        saveUninitialized: false,
        rolling: true,

        name: "SID",
        cookie: {
            httpOnly: true,
            maxAge: config.SESSION_LENGTH,
        },
    });
};
