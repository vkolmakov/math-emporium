import {
    UT_GET_PUBLIC_SETTINGS,
    UT_GET_PUBLIC_SETTINGS_DELTA,
    UT_DISPLAY_ANNOUNCEMENT,
    UT_HIDE_ANNOUNCEMENT,
    UT_WINDOW_RESIZE,
} from "./actions";
import { SCREEN_SIZE } from "@client/constants";

function isDesktop(w) {
    return w.innerWidth >= SCREEN_SIZE.MEDIUM;
}

const INITIAL_UTIL_STATE = {
    isAnnouncementDisplayed: false,
    settings: {
        applicationMainHomePictureLink: "",
        applicationTitle: "math-emporium",
        faqContent: void 0,
        announcementContent: "",
        announcementBackgroundColor: "",
        announcementTextColor: "",
    },
    isSimplifiedSchedulingUxEnabled: true,
    isDesktop: isDesktop(window),
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
        case UT_WINDOW_RESIZE:
            return { ...state, isDesktop: isDesktop(action.payload.window) };
        case UT_GET_PUBLIC_SETTINGS:
            if (action.payload instanceof Object) {
                return { ...state, settings: action.payload };
            }
            return state;
        case UT_GET_PUBLIC_SETTINGS_DELTA:
            if (action.payload instanceof Object) {
                return {
                    ...state,
                    settings: { ...state.settings, ...action.payload },
                };
            }
            return state;
        case UT_DISPLAY_ANNOUNCEMENT:
            return { ...state, isAnnouncementDisplayed: true };
        case UT_HIDE_ANNOUNCEMENT:
            return { ...state, isAnnouncementDisplayed: false };
        default:
            return state;
    }
}
