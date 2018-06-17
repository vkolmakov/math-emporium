import express from "express";

import requireGroup from "../middleware/requireGroup";
import { authGroups } from "../aux";

export default function createManageUserRouter() {
    const controller = require("../users/users.manage.conroller");
    const router = express.Router();

    router.get(
        "/users",
        requireGroup(authGroups.EMPLOYER),
        controller.handleGet
    );
    router.get(
        "/users/:id",
        requireGroup(authGroups.EMPLOYER),
        controller.handleGetId
    );
    router.put(
        "/users/:id",
        requireGroup(authGroups.EMPLOYER),
        controller.handleUpdate
    );

    return router;
}
