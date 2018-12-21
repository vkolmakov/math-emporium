import express from "express";
import requireGroup from "../middleware/requireGroup";
import { authGroups } from "../aux";

import {
    handleGetOpenSpots,
    handleGetAvailableTutors,
} from "../services/openSpots/openSpots.controller";
import { handleGetAppointments } from "../services/appointments/appointments.controller";
import { handleGetChromeExtensionData } from "../services/chromeExtensionData/chromeExtensionData.controller";
import {
    handleGetAllEvents,
    handleGetLatestEvents,
} from "../services/events/events.controller";
import {
    handleGetSettings,
    handleGetPublicSettings,
    handleUpdateSettings,
} from "../services/settings/settings.controller";
import { handleGetAllErrorEvents } from "../services/errorEvent/errorEvent.controller";

export default function createUtilRouter() {
    const router = express.Router();

    router.get("/open-spots", handleGetOpenSpots);
    router.get(
        "/available-tutors",
        requireGroup(authGroups.USER),
        handleGetAvailableTutors
    );

    router.get(
        "/appointments",
        requireGroup(authGroups.EMPLOYER),
        handleGetAppointments
    );
    router.get(
        "/chrome-extension-data",
        requireGroup(authGroups.EMPLOYER),
        handleGetChromeExtensionData
    );

    router.get(
        "/events",
        requireGroup(authGroups.EMPLOYER),
        handleGetAllEvents
    );
    router.get(
        "/events/latest",
        requireGroup(authGroups.EMPLOYER),
        handleGetLatestEvents
    );

    router.get(
        "/error-events",
        requireGroup(authGroups.ADMIN),
        handleGetAllErrorEvents
    );

    router.get("/public/settings", handleGetPublicSettings);
    router.get(
        "/settings",
        requireGroup(authGroups.EMPLOYER),
        handleGetSettings
    );
    router.put(
        "/settings",
        requireGroup(authGroups.ADMIN),
        handleUpdateSettings
    );

    return router;
}
