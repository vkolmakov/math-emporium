import express from "express";

import requireGroup from "../middleware/requireGroup";
import { authGroups } from "../aux";

export default function createUserRouter() {
    const controller = require("../users/users.controller");
    const router = express.Router();

    router.get(
        "/user/profile",
        requireGroup(authGroups.USER),
        controller.getProfile()
    );
    router.put(
        "/user/profile",
        requireGroup(authGroups.USER),
        controller.updateProfile()
    );

    return router;
}
